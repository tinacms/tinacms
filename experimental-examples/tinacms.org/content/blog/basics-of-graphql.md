---
title: GraphQL Basics
date: '2022-05-12T07:00:00.000Z'
author: James Perkins
prev: content/blog/announcing-extending-tina.md
---
​​
The Tina team is a big fan of GraphQL, and it is a core component of our project. One reason for this is that it allows a developer to retrieve only the data required and makes it easier to evolve APIs. This blog post will cover the basics of GraphQL. 

## Queries

Queries are the means of retrieving data from a server. If you have used REST before, this is the equivalent of a `GET` request, except with GraphQL, you have much more control. You can request as much (or as little) data as you need, making GraphQL a powerful development tool. Below is an example of a query in GraphQL:

```graphql
query MyAwesomeQuery(){
	# make our query here
}
```

### Fields

Fields are data you would like to retrieve from GraphQL. Fields describe the shape of the content that the server should return in the response. For example:

```graphql
query MyAwesomeQuery(){
	user{
		name
  }
}

# Response

{
  "data": {
    "user": {
      "name": "James"
    }
  }
}
```

You can see that the query and the result are the same shape. GraphQL is powerful because you always know what to expect to receive back from the server, and the server knows what fields the client is requesting.

You can also make requests for *sub-selection fields*. GraphQL queries can traverse related objects and fields, letting clients fetch related data in a single request. For example, if we needed all the blog posts that a user wrote, we could request them, and the server will return all of them.

```graphql
query MyAwesomeQuery(){
	user{
		name
		posts{
			title
		}
  }
}

# What is returned

{
  "data": {
    "user": {
      "name": "James"
			"posts": [
        {
          "title": "Tina in 2022"
        },
        {
          "title": "From Contextual to CMS"
        },
        {
          "title": "How to automate PRs."
        }
      ]
    }
  }
}
```

## Arguments

GraphQL also supports arguments, just like REST. Unlike REST, you can only send a single set of arguments, and you might have to make multiple requests. GraphQL supports arguments for every field or object. You can specify the exact data you need, and the server will only return that data. Arguments can help you with a lot of data or avoid unnecessary data loading into your application.

You can also use arguments to control the structure of your data. For example, you might want to get all posts from a particular author but only include the title and date published field. You could do this by passing an argument to GraphQL that specifies which author and the title and body fields you want to be returned.

```jsx
{
  posts(author: "James Perkins") {
    title
    published_date
  }
}

{
  "data": {
			"posts": [
        {
          "title": "From Contextual to CMS"
					"published_date": "2022-01-22T05:00:00.000Z"
        },
        {
          "title": "How to automate PRs"
					"published_date": "2022-01-22T05:00:00.000Z"
        }
      ]
    }
  }
}
```

## **Fragments**

GraphQL fragments are a way to break up a GraphQL query into smaller, more manageable pieces. Fragments can be helpful when you're trying to figure out what's going on in a complex query or when you just need to take a small piece of data from a larger dataset. Fragments can also be reused wherever you might need the data you have defined, 

To create a fragment, start by defining a new type. This type will represent the data you want to extract from your query. Once you've defined the type, you can use it in your queries just like any other type. Here is an example of an author Fragment, which is created from our Author Type:

```graphql

// simplified version of Author
type Author {
  title: String
  email: String
  name: String
  twitter: String
  github: String
  linkedin: String
  bio: String
  image: String
  id: ID!
  _sys: SystemInfo!
  _values: JSON!
}

// Fragment of important pieces for a bio.
fragment AuthorParts on Author {
  email
  name
  twitter
  bio
  image
}
```

## Variables

Variable substitution is a key concept in GraphQL. When you specify a field, you can optionally provide a list of variables to be used as inputs for that field. For example, the following query specifies the name variable of John:

```graphql
query { person(name: "John") { age } }
```

This query will return the age field for the person with the given name. This isn’t great because we are hard coding the name of `John`.  This is where we start to use variables. To use a variable, you need three things:

1. Replace the hardcoded value with `$variableName`. So for this, we would use `$name` instead of hardcoding `John`.
2. Declare the variable as one of the accepted variables in the query along with the Type. The name variable would have the type `String` in this case.
3. Include the `variableName: value` in the query:

```graphql
query getAge($name: String) {
  person(name: $name) {
    age
  }
}

variables:
{
  "name": "john"
}
```

### Default Value variables

You can also have a default value variable(s). When default values are provided for all variables in a query, you can then call the query with no variables, and data will be returned. For example:

```graphql
query getAge($name: String = "John') {
  person(name: $name) {
    age
  }
}
```

If no variable is provided, it will use `John` and return his age. If you have more variables, you can use a mix of defaults and variables sent to the query.

## Mutations

Mutations in GraphQL are used to change the data in your application, similar to `PUT` or `POST` requests in REST. As with queries, if your returned data is an object type, you can request just the nested fields. This means you can return only the data you need, versus returning all of the data and having to parse the parts you do need:

```graphql
mutation createNewAuthor($name: String, $bio: String, $twitter: String, $image: String){
	creatAuthor(name: $name, bio: $bio, twitter: $twitter, image: $image){
		id
		name
	}
}
```

 In this example, we create a new Author and return just the author's id and name on successful creation.

## **How to keep up to date with Tina?**

The best way to keep up with Tina is to subscribe to our newsletter. We send out updates every two weeks. Updates include new features, what we have been working on, blog posts you may have missed, and more!

You can subscribe by following this link and entering your email: [https://tina.io/community/](https://tina.io/community/)

### Tina Community Discord

Tina has a community [Discord](https://discord.com/invite/zumN63Ybpf) full of Jamstack lovers and Tina enthusiasts. When you join, you will find a place:

- To get help with issues
- Find the latest Tina news and sneak previews
- Share your project with the Tina community, and talk about your experience
- Chat about the Jamstack

### Tina Twitter

Our Twitter account ([@tina_cms](https://twitter.com/tina_cms)) announces the latest features, improvements, and sneak peeks to Tina. We would also be psyched if you tagged us in projects you have built.

