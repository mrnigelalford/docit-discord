// @ts-nocheck
import axios from 'axios';
import { ChannelType, Client, IntentsBitField, Message, TextChannel } from 'discord.js';
import 'dotenv/config';

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.DirectMessages] });

client.once('ready', () => {
  console.log('Ready!');
});

client.on('interactionCreate', interaction => {
  console.log(interaction);
});

const removeID = (inputString: string) => inputString.replace(/<@\d+>/g, '').trim();

client.on("messageCreate", async (message) => {
  const { guildId, content, author } = message;

  if (!content.length || message.author.bot || message.author.id === process.env.DISCORD_BOT_ID) return
  switch (guildId) {
    case '899867212309987378':
      const response = await getChat(removeID(content), 'balancer');
      // send message to user in thread
      setMessageToThreads(message, response)
    //TODO: respond to user with follow up questions here.
  }
});

const setMessageToThreads = async (message: Message, response: any) => {
  const threadChannel = await message.startThread({
    name: 'docIT',
    autoArchiveDuration: 60,
    type: ChannelType.PrivateThread,
    message: { content: response.answer },
    reason: 'separate thread for documentation',
  });
  threadChannel.members.add(message.author);
  threadChannel.send(response.answer);
}

const getChat = async (question: string, projectID: string): Promise<JSON | unknown> => {
  const getResponse = await axios.get(`${process.env.DOCIT_INFRA}/questions`, { data: { question, projectID }, auth: { username: 'admin', password: process.env.DOCIT_AUTH } });

  return getResponse.data;
}

client.login(process.env.DISCORD_TOKEN);

//TODO: Guild = server. Create a map of each guild to route calls for specified blockchain or project :-)