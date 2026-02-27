export class MessageFormatterService {
  format(message: string): string {
    return `[${new Date().toISOString().split('.').at(0)?.replace('T', ' ')}] ${message}`;
  }
}
