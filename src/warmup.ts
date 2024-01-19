import { client } from "./app";

client.once('ready', () => {
  console.log(`Warmed up in discord! Logged in as ${client.user.tag}`);
});