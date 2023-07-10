const AFIP_URLS = {
	HOMO: {
		wsaa: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?wsdl',
		service: 'https://wswhomo.afip.gov.ar/{service}/service.asmx?wsdl' //wsfev1
	},
	PROD: {
		wsaa: 'https://wsaa.afip.gov.ar/ws/services/LoginCms?wsdl',
		service: 'https://servicios1.afip.gov.ar/{service}/service.asmx?WSDL' //wsfev1
	}
};

class AfipUrls {

	static get urls() {
		return process.env.HOMO ? AFIP_URLS.HOMO : AFIP_URLS.PROD
	}

	static get wsaa() {
		return this.urls.wsaa;
	}

	static getService(service) {
		return this.urls.service.replace('{service}', service);
	}
}

module.exports = {
	AfipUrls,
	AFIP_URLS
};
