export class t {
  static safeString(a) {
    if (typeof a !== 'string') {
      throw new Error('must be string');
    }
    return a;
  }
}
export class Post extends Jig {
  _maxPostLength = 500;

  init({ content, app, replyTo }) {
    if (app.constructor !== App)
      throw new Error('can only create post from app context');
    if (replyTo && replyTo.constructor !== Post) {
      throw new Error('replyTo must be instance of Post');
    }
    content = t.safeString(content);
    if (content.length > this._maxPostLength) {
      throw new Error(`max post length is ${this._maxPostLength}`);
    }
    this.app = app;
    this.content = content;
    this.replyTo = replyTo;
  }
}

export class App extends Jig {
  init(name) {
    this.name = name;
  }

  createPost({ content }) {
    return new Post({ content, app: this });
  }
}

App.deps = { Post };

Post.deps = { t, App };
