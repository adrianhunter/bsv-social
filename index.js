class t {
  static safeString(a) {
    if (typeof a !== 'string') {
      throw new Error('must be string');
    }
    return a;
  }
}
class Post extends Jig {
  _maxPostLength = 500;

  init({ content, app }) {
    if (app.constructor !== App)
      throw new Error('can only create post from app context');
    content = t.safeString(content);
    if (content.length > this._maxPostLength) {
      throw new Error(`max post length is ${this._maxPostLength}`);
    }
    this.app = app;
    this.content = content;
  }

  comment({ content }) {
    return new Comment({ content, app: this.app, replyTo: this });
  }
}

class Comment extends Post {
  init({ content, app, replyTo }) {
    if (replyTo.constructor !== Post) {
      throw new Error('replyTo must be instance of Post');
    }
    // super.init({ content, app });
    this.replyTo = replyTo;
  }
}

class App extends Jig {
  init(name) {
    this.name = name;
  }

  createPost({ content }) {
    return new Post({ content, app: this });
  }
}

App.deps = { Post };

Post.deps = { t, App, Comment };

async function main() {
  const run = new Run({ network: 'mock' });

  const app = new App('bucksup');

  const post = app.createPost({ content: 'wow dude' });

  window.app = app;
  window.post = post;
  window.Post = Post;

  //   const comment = post.comment({ content: 'this is my comment' });

  //   console.log(app, post, comment);
}

main();
