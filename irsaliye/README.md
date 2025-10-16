# İrsaliye Okuyucu

Fotoğraf ile irsaliye okuma ve kaydetme uygulaması. Bu uygulama ile mobil cihazınızla çektiğiniz irsaliye fotoğraflarını yükleyebilir, sistem OCR ile gerekli alanları otomatik çıkarabilir ve kaydedebilirsiniz.

## Özellikler

- Fotoğraf yükleme (mobil destekli)
- Azure Form Recognizer ile OCR işlemi
- Otomatik alan çıkarımı:
  - İrsaliye No
  - İrsaliye Tarihi
  - Mal/Ürün Adı
  - Adet (+Birim)
- Güven skoru gösterimi
- Kayıtların listelenmesi ve düzenlenmesi
- CSV dışa aktarma
- Tam mobil uyumlu arayüz

## Teknolojiler

- [Next.js](https://nextjs.org/) 14+ (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) (Stil)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions) (API)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Veritabanı)
- [Azure Form Recognizer](https://azure.microsoft.com/en-us/services/form-recognizer/) (OCR)

## Sıfır Yerel Kurulum - Vercel'e Tek Tıkla Deploy

Bu proje yerel kurımdan bağımsız olarak doğrudan Vercel Dashboard üzerinden deploy edilebilir.

### 1. Adım: Vercel Dashboard'una Giriş

1. [Vercel](https://vercel.com/) hesabınıza giriş yapın
2. Yeni bir proje oluşturmak için "New Project" butonuna tıklayın

### 2. Adım: Projeyi Import Et

1. "Import Git Repository" seçeneğini seçin
2. Bu projeyi GitHub, GitLab veya Bitbucket'tan import edin
3. Veya "Deploy without Git" seçeneği ile doğrudan deploy edin

### 3. Adım: Environment Variables (Ortam Değişkenleri)

Deploy sırasında aşağıdaki ortam değişkenlerini ekleyin:

```bash
# OCR Sağlayıcısı
OCR_PROVIDER=azure

# Azure Form Recognizer Ayarları
AZURE_FORM_RECOGNIZER_ENDPOINT=https://<senin-adin>.cognitiveservices.azure.com/
AZURE_FORM_RECOGNIZER_KEY=<anahtar>

# Vercel Postgres Bağlantısı (Vercel tarafından otomatik sağlanır)
DATABASE_URL=postgresql://<vercel-postgres-url>
```

### 4. Adım: Deploy

1. "Deploy" butonuna tıklayın
2. Vercel otomatik olarak bağımlılıkları yükleyecek ve projeyi derleyecektir
3. Deploy tamamlandığında uygulamanız yayında olacaktır

## Veritabanı Yapılandırması

Uygulama Vercel Postgres kullanmaktadır. Deploy sonrası aşağıdaki adımları izleyin:

1. Vercel Dashboard > Storage > Create New > Postgres
2. Veritabanını projenize bağlayın
3. Aşağıdaki SQL komutlarını çalıştırarak tabloyu oluşturun:

```sql
-- receipts tablosunu oluştur
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Azure Form Recognizer Yapılandırması

1. Azure Portal'a giriş yapın
2. "Form Recognizer" kaynağı oluşturun
3. Oluşturduktan sonra "Keys and Endpoint" sekmesine gidin
4. "KEY 1" ve "Endpoint" bilgilerini alın
5. Bu bilgileri Vercel ortam değişkenleri olarak ekleyin

## Geliştirme İçin Yerel Kurulum (İsteğe Bağlı)

Yerel geliştirme yapmak isterseniz:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## API Endpoint'leri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/upload` | Fotoğraf yükleme ve OCR işlemi |
| POST | `/api/save` | İrsaliye kaydetme |
| GET | `/api/records` | Tüm kayıtları listeleme |
| PUT | `/api/records/:id` | Kayıt güncelleme |
| DELETE | `/api/records/:id` | Kayıt silme |
| GET | `/api/export.csv` | CSV olarak dışa aktarma |

## Dosya Boyutu ve Tür Kısıtlamaları

- Maksimum dosya boyutu: 10 MB
- İzin verilen dosya türleri: JPEG, PNG, BMP, TIFF

## Katkıda Bulunma

1. Forklayın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Proje linki: [https://github.com/kullanici/irsaliye-okuyucu](https://github.com/kullanici/irsaliye-okuyucu)