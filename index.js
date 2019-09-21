const Buffer = require('buffer').Buffer

class t {
  static safeString(a) {
    if (typeof a !== 'string') {
      throw new Error('must be string');
    }
    return a;
  }
}


class UserProfile extends Jig {

  init({username, profilePicture, bio, status}) {    
    this.username = t.safeString(username);
    this.profilePicture = profilePicture;
    this.bio = bio;
    if (profilePicture) {
      this.setProfilePicture(profilePicture);
    }
    this.status = status;
  }
  
}


UserProfile.deps = {t}


class Like extends Jig {
  
  init({likedJig}) {
    if(likedJig.constructor !== Post && likedJig.constructor !== Comment) {
      throw new Error('can only like posts or comments')
    }
    this.likedJig = likedJig 
    this.liked = true
  }

  destroy(){
    this.owner = '000000000000000000000000000000000000000000000000000000000000000000'
  }

}

class Post extends Jig {

  init({ content, app }) {
    this._maxPostLength = 500;
    if (app.constructor !== App)
      throw new Error('can only create post from app context');
    content = t.safeString(content);
    if (content.length > this._maxPostLength) {
      throw new Error(`max post length is ${this._maxPostLength}`);
    }
    this.app = app;
    this.content = content;
    this.status = 'published'
  }

  comment({ content }) {
    return new Comment({ content, app: this.app, replyTo: this });
  }

  like() {
    return new Like({likedJig: this})
  }

  delete() {
    this.state = 'deleted'
  }
}

class Retweet extends Post {
  init({ post, ...opts }) {
    this.post = post;
    super.init(opts);
  }
}

class Comment extends Post {
  init({ content, app, replyTo }) {
    if (replyTo.constructor !== Post) {
      throw new Error('replyTo must be instance of Post');
    }
    super.init({ content, app });
    this.replyTo = replyTo;
  }
}

class Message extends Jig {
  init({ recipient, content, isEncrypted }) {
    this.recipient = recipient;
    this.content = content;
    this.isEncrypted = isEncrypted;
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
Like.deps = {Post, Comment}

Post.deps = { t, App, Comment, Like };
Comment.deps = {Like}


async function main() {
  const run = new Run({ network: 'mock', app: 'bucksup' });

  const app = new App('bucksup');
  window.app = app;
  window.Post = Post;

  const post = app.createPost({ content: 'wow dude' });
  const like = post.like()
  const comment = post.comment({ content: 'this is my comment' });
  const likeComment = comment.like()


  const profile = new UserProfile({
    username: 'Merlin'
  })
  const recipient = new UserProfile({
    username: 'Adrian'
  })

  const alice = bsvEcies()
    .privateKey(run.purse.privkey)
    .publicKey(bsv.PublicKey.fromString(recipient.owner));

  const message = new Message({ recipient: recipient.owner, content: alice.encrypt('Hello, Paul').toString("hex") })

  const bob = bsvEcies()
    .privateKey(run.purse.privkey)
    .publicKey(bsv.PublicKey.fromString(message.owner));

  const receivedMessage = bob.decrypt(Buffer.from(message.content, "hex")).toString()
  
  console.log(receivedMessage)
}

main();
