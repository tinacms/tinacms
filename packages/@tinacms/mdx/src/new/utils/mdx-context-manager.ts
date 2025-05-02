type MDXContext = {
  imageCallback: (image: string) => string;
};

export class ContextManager {
  private static instance: ContextManager;
  private context: MDXContext;

  private constructor() {
    this.context = {
      imageCallback: (image: string) => image, // Default implementation
    };
  }

  static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  setImageCallback(callback: (image: string) => string): void {
    this.context.imageCallback = callback;
  }

  getImageCallback(): (image: string) => string {
    return this.context.imageCallback;
  }
}

