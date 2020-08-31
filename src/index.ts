
import "reflect-metadata"
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const post = orm.em.create(Post, {title: 'my first post'})
  await orm.em.persistAndFlush(post);
  
  const app = express()
  app.get('/', (_, res) => {
    res.send('hello world!')
  })

  const apolloServe = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false
    }),
    context: () => ({ em: orm.em })
  })

  apolloServe.applyMiddleware({ app })

  app.listen(4000, () => {
    console.log('serve started on localhost:40000')
  })
};

main().catch(err => {
  console.error(err)
});