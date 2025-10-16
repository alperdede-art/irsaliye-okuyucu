import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";

interface ReceiptData {
  invoiceNumber: string;
  date: string;
  productName: string;
  quantity: number;
  unit: string;
  confidence: number;
}

export async function extractReceiptData(file: File): Promise<ReceiptData> {
  // Get environment variables
  const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
  const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY;
  
  if (!endpoint || !apiKey) {
    throw new Error("Azure Form Recognizer credentials not configured");
  }
  
  // Initialize the client
  const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
  
  // Convert file to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Analyze document using the prebuilt invoice model
  const poller = await client.beginAnalyzeDocument("prebuilt-invoice", buffer);
  const { documents } = await poller.pollUntilDone();
  
  if (!documents || documents.length === 0) {
    throw new Error("No documents found in the analysis result");
  }
  
  const document = documents[0];
  
  // Extract fields with fallback logic
  const invoiceNumber = extractInvoiceNumber(document);
  const date = extractDate(document);
  const { productName, quantity, unit } = extractProductInfo(document);
  
  // Calculate average confidence
  const confidence = calculateAverageConfidence(document);
  
  return {
    invoiceNumber,
    date,
    productName,
    quantity,
    unit,
    confidence
  };
}

function extractInvoiceNumber(document: any): string {
  // Try to get invoice number from standard field
  if (document.fields?.InvoiceId?.value) {
    return document.fields.InvoiceId.value;
  }
  
  // Fallback: Try to find with regex pattern
  const content = document.content || "";
  const invoiceNumberRegex = /(IR|İRS)\s*[-.]?\s*\d+[-.]?\d*/i;
  const match = content.match(invoiceNumberRegex);
  
  return match ? match[0] : "Bulunamadı";
}

function extractDate(document: any): string {
  // Try to get invoice date from standard field
  if (document.fields?.InvoiceDate?.value) {
    const date = new Date(document.fields.InvoiceDate.value);
    return formatDate(date);
  }
  
  // Fallback: Try to find date with regex patterns
  const content = document.content || "";
  
  // Try different date formats
  const datePatterns = [
    /(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/, // dd/mm/yyyy or dd-mm-yyyy or dd.mm.yyyy
    /(\d{4})[\/\-\.](\d{2})[\/\-\.](\d{2})/, // yyyy-mm-dd
  ];
  
  for (const pattern of datePatterns) {
    const match = content.match(pattern);
    if (match) {
      if (match[1].length === 4) {
        // yyyy-mm-dd format
        return `${match[3]}.${match[2]}.${match[1]}`;
      } else {
        // dd/mm/yyyy format
        return `${match[1]}.${match[2]}.${match[3]}`;
      }
    }
  }
  
  return "Bulunamadı";
}

function extractProductInfo(document: any): { productName: string; quantity: number; unit: string } {
  // Try to get items from standard fields
  if (document.fields?.Items?.value) {
    const items = document.fields.Items.value;
    if (items.length > 0) {
      const item = items[0]; // Take the first item
      const productName = item.properties?.Description?.value || "Bulunamadı";
      const quantity = item.properties?.Quantity?.value || 1;
      const unit = extractUnit(item.properties?.Unit?.value || "adet");
      
      return { productName, quantity, unit };
    }
  }
  
  // Fallback: Try to extract from content with heuristics
  const content = document.content || "";
  
  // Look for common product patterns
  const productRegex = /([A-Za-zÇçĞğİıÖöŞşÜü\s]+)\s+(\d+(?:[.,]\d+)?)\s*(adet|kg|ton|pcs)/i;
  const match = content.match(productRegex);
  
  if (match) {
    return {
      productName: match[1].trim(),
      quantity: parseFloat(match[2].replace(',', '.')),
      unit: extractUnit(match[3])
    };
  }
  
  return {
    productName: "Bulunamadı",
    quantity: 1,
    unit: "adet"
  };
}

function extractUnit(unitText: string): string {
  const unit = unitText.toLowerCase();
  
  if (unit.includes("kg")) return "kg";
  if (unit.includes("ton")) return "ton";
  if (unit.includes("pcs") || unit.includes("piece")) return "pcs";
  
  return "adet";
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
}

function calculateAverageConfidence(document: any): number {
  if (!document.fields) return 0.5;
  
  const confidences: number[] = [];
  
  // Collect confidence values from all fields
  Object.values(document.fields).forEach((field: any) => {
    if (field.confidence !== undefined) {
      confidences.push(field.confidence);
    }
  });
  
  // Calculate average
  if (confidences.length === 0) return 0.5;
  
  const sum = confidences.reduce((a, b) => a + b, 0);
  return sum / confidences.length;
}