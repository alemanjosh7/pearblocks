# Pearblocks.

This app is a CLI dictionary that works as serverless application using hyperswarm, corestore, hyperbee, b4a, bare-readline and bare-tty, and where you can look for specific information about a Holepunch's blocks or terminology such as Hyperbee, Hyperswarm, etc

## Usage

### Start

First of all, to start using this CLI you need to run the following command.

```js
pear dev
```

After that the CLI will start working and you can execute the following commands

```bash
Usage: pearblocks [command] [options]

Commands:
  init <key>               Starts importing or seeding Pearblocks Dictionary with a specific Hypercore Key
  beekey <key>             With a Hypercore key you can ask what is your Hyperbee Key
  ask <word> <key>         Ask about a specific word in the dictionary with a specific Hypercore key
```

## Help

Use `pearblocks --help` for more information.

## Import dictionary

```js
> pearblock init dict
Your core key is: dict
Importing dictionary...
Dictionary imported!
```

## Request hyperbee key

> pearblock hyperkey
> You can connect start asking now with this Hyperbee key: 786ed2df6946c4fe4d24256d15b9428aef88a5206f2eecfaff4cb72245dc1486

## Asking to the dictionary

```js
> pearblock ask hypercore
The Pear Block you want to know about is: hypercore
Holepunch's Block hypercore is: Hypercore is a secure, distributed append-only log built for sharing large datasets and streams of real-time data. It comes with a secure transport protocol, making it easy to build fast and scalable peer-to-peer applications.
```

If there is no response the following output would be received

```js
> pearblock ask hypercore
No dictionary entry for hypercore
```
