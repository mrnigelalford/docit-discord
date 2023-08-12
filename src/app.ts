// @ts-nocheck
import axios from 'axios';
import { ChannelType, Client, IntentsBitField, Message } from 'discord.js';
import 'dotenv/config';
import splitIntoMarkdownParagraphs from './textTool.js';

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.DirectMessages] });
const removeID = (inputString: string) => inputString.replace(/<@\d+>/g, '').trim();

const setMessageToThreads = async (message: Message, response: any) => {
  const threadChannel = await message.startThread({
    name: 'docIT',
    autoArchiveDuration: 60,
    type: ChannelType.PrivateThread,
    message: { content: splitIntoMarkdownParagraphs(response.answer) },
    reason: 'separate thread for documentation',
  });
  threadChannel.members.add(message.author);
  threadChannel.send(response.answer);
}

client.once('ready', (c) =>	console.log(`Ready! Logged in as ${c.user.tag}`));

/*
client.on('interactionCreate', interaction => {
  console.log(interaction);
});
*/

client.on("messageCreate", async (message) => {
  const { guildId, content, author } = message;
  if (!content.length || author.bot || author.id === process.env.DISCORD_BOT_ID) return
  switch (guildId) {
    case '899867212309987378': // TODO: Move this to a db function to return valid variables here
      const response = await getChat(removeID(content), 'balancer');
      // send message to user in thread
      setMessageToThreads(message, response)
    //TODO: respond to user with follow up questions here.
  }
});

const getChat = async (question: string, projectID: string): Promise<JSON | unknown> => {
  const getResponse = await axios.get(`${process.env.DOCIT_INFRA}/questions`, { data: { question, projectID }, auth: { username: 'admin', password: process.env.DOCIT_AUTH } });

  return getResponse.data;
}

client.login(process.env.DISCORD_TOKEN);

//TODO: Guild = server. Create a map of each guild to route calls for specified blockchain or project :-)