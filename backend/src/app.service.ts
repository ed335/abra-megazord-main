export class AppService {
  getHello() {
    return { message: 'AbraCann backend is running' };
  }

  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
