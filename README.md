# SSO Authorization Servisi

Bu uygulama, Patika'nın düzenlediği AloTech Fullstack Bootcamp'i bitirme projesinin bir parçasıdır.

#### Grup - 5
> Eren Tanrıverdioğlu - Furkan Aktaş - Parahat Nepesov - Timur Turbil

## Projenin Mimarisi
![project architecture](https://github.com/Alotech-Bootcamp-5-Grup/user-manager-module/blob/main/project_analysis.jpg)

## Servisin İşlevi
SSO Authorization Servisi, birden fazla servisin, tek merkezden yapılan kullanıcı girişiyle kullanılabilmesini sağlar. Bağlı servis ve uygulamalar, giriş isteklerini SSO servisine yönlendirir, endpoint'lerine yapılan isteklerde kullanıcı ve yetki doğrulaması için SSO servisine istek gönderir.

## Teknoloji ve Kütüphaneler
Backend:
- Express
- Bcrypt
- MySQL2
- Winston

Frontend:
- React
- Axios
- universal-cookie

## Kurulum

- Projeyi klonlayın:
`git clone https://github.com/Alotech-Bootcamp-5-Grup/sso-service.git`

- Server klasörüne girin:
`cd sso-service/server`

- Gerekli kütüphaneleri kurun:
`npm install`

- .env dosyasını oluşturun:
windows: `rename  .env-sample  .env`
linux/unix: `mv .env-sample .env`

- .env dosyasındaki değişkenlere gerekli değerleri atayın
`PORT=`: Ugulamanızın çalışmasını istediğiniz portu belirtin.
`DB_HOST=`: MySQL veritabanınız için host bilgilerini belirtin. örn: localhost
`DB_USER=`: MySQL veritabanı kullanıcı adını belirtin.
`DB_PASS=`: MySQL veritabanı kullanıcı parolasını belirtin.
`DB_NAME=`: MySQL veritabanı adını belirtin.
`URLS=`: SSO Authorization Servisi'ni kullanacak servis ve uygulamaların URL'lerini liste olarak belirtin. örn:  ["http://localhost:3000", "http://localhost:3010"]
`DEBUG_MODE=`: Uygulamanızın hangi seviyede loglama yapacağını belirtin. En kritikten en önemsize: error - warn - info - http - verbose - debug - silly

- Sunucuyu çalıştırın:
`npm start`

- Frontend klasörüne girin:
`cd ../frontend`

- Gerekli kütüphaneleri kurun:
`npm install`

- .env dosyasını oluşturun:
windows: `rename  .env-sample  .env`
linux/unix: `mv .env-sample .env`

- .env dosyasındaki değişkenlere gerekli değerleri atayın
`PORT=`: Ugulamanızın çalışmasını istediğiniz portu belirtin.
`REACT_APP_SSO_SERVER_URL=`: SSO servisinin sunucu URL'ini belirtin. örn: http://localhost:3010/
`REACT_APP_DEFAULT_REDIRECT_URL=`: Uygulamaya bir yönlendirme noktası belirtilmeden erişilmesi halinde kullanıcının yönlendirileceği varsayılan adresi belirtin. örn: http://localhost:3000/

- Uygulamayı çalıştırın:
`npm start`

## Veritabanı

SSO Authorization Servisi'nin sunucusu çalıştırıldığında, veritabanında `logs` tablosu oluşturur. Eğer tablo daha önceden oluşturulmuşsa işlem yapmaz. Tablonun DDL'i aşağıdaki gibidir:
```
CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level` varchar(16) NOT NULL,
  `message` varchar(2048) NOT NULL,
  `meta` varchar(2048) NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`)
);
```

## İstekler ve Yanıtlar

SSO Authorization Servisi'nin backendinin 2 adet endpoint'i bulunur.

Kullanıcı girişi için username ve user_password bilgileri JSON formatında, istek gönderilen URL de parametre olarak eklenerek `/` adresine post isteği gönderilir.
```
post /?redirectURL=
{
    username: string,
    user_password: string
}

response - 200
{
    response: boolean,
    user_id: integer,
    Access_Token: string,
    user_type: string
}

response - 400/500
{
    response: boolean,
    message: string
}
```

Token geçerliliğinin kontrolü için, header kısmında `x-access-token` olarak token bilgisi ve URL parametresi olarak da istek gönderilen URL bilgisi eklenerek `/token` adresine get isteği gönderilir.
```
get /token/?redirectURL=
headers["x-access-token"]: string

response - 200
{
    response: boolean,
    user_id: integer,
    user_type: string
}

response - 400/500
{
    response: boolean,
    message: string
}
```

## Test

Servis ve uygulama klasörleri içerisinde:
`npm test`
