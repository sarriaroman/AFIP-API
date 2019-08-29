
# AFIP API simplificada  

La función principal de este API es simplificar el acceso a los WebServices de AFIP y principalmente Factura Electrónica. Para generar los certificados y darse de alta en el Servicio de Homologación (Pruebas) usar esta web: [AFIP WS](http://www.afip.gob.ar/ws)  

### Pasos para hacer funcionar el API  
1) Desde el root ```npm install```  
2) Desde el root correr ```./tools/keygen.sh /C=AR/O=Nombre Desarrollador/CN=Nombre Desarrollador/serialNumber=CUIT 00000000000```  
3) Correr la app  
3a) Para Homologación: ```HOMO=true node server.js```  
3b) Para Producción: ```node server.js```    


### Endpoints  
> Para probar los endpoints que genera el API se proveen ejemplos con el API WSFEv1 mediante postman (Descarga: https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop )  
  
1) Luego de descargar Postman importar el archivo que se encuentra en la carpeta "postman"  
1) Para aquellos Endpoints que requiren CUIT Revisar los parametros Body y cambiar CUIT  


### Cómo funcionan los endpoints  
> La idea del API es hacer genéricas las llamadas y preservar la autenticación obtenida  

1) Describir el endpoint: ```/api/aqui_servicio/describe```. Ej. de Servicio: ```wsfev1```  
2) Para realizar llamado ```/api/aqui_servicio/aqui_metodo```  
2a) Servicio: ```wsfev1```  
2b) Método: ```FEDummy```. Puede ser cualquiera de los obtenidos mediante describe.

Versiones:

__0.7.0:__  
- Se elimina Express y se lo reemplaza por Restana para mayor performance.
- Se agrega un handler para poder ser usado en ambientes serverless ( Requiere cambiar el servicio de Cache en estos ambientes )
- La cache se basa en archivos y no librerias externas.
- Se elimina Lodash.
- El cambio a Restana permite utilizar HTTPS y HTTP/2
- Mejoras en algunos métodos basadas en NodeJS 10+.
- Se cambia la versión de Node a 10 como mínimo.
- Se elimina la necesidad de Node-GYP
  