const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Seyahat ve Rota Planlayici API',
            version: '1.0.0',
            description: 'Sistem Analizi ve Tasarimi Dersi API Dokümantasyonu',
            contact: { name: 'Merve Yariz' }
        },
        servers: [{ url: 'http://localhost:5000' }],
        paths: {
            '/api/travels': {
                get: {
                    summary: 'Tum seyahatleri listeler',
                    responses: { 200: { description: 'Basarili' } }
                },
                post: {
                    summary: 'Yeni seyahat ekler',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object', // Buraya tırnak ekledik!
                                    properties: {
                                        destination: { type: 'string' },
                                        date: { type: 'string' },
                                        pnr: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Olusturuldu' } }
                }
            },
            '/api/travels/{id}': {
                delete: {
                    summary: 'Seyahat siler',
                    parameters: [{
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' }
                    }],
                    responses: { 200: { description: 'Silindi' } }
                }
            }
        }
    },
    apis: [] 
};

module.exports = swaggerJsDoc(swaggerOptions);