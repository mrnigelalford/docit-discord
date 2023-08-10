// @ts-nocheck
import axios from 'axios';
import { ChannelType, Client, IntentsBitField, TextChannel } from 'discord.js';
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

  if(!content.length || message.author.bot || message.author.id === '1138959598536097842') return
  switch (guildId) {
    case '899867212309987378':
      const response = await getChat(removeID(content), 'balancer');
      
        // send message to user in thread
        const threadChannel = await message.startThread({
          name: 'docIT Answer',
          autoArchiveDuration: 60,
          type: ChannelType.PrivateThread,
          message: { content: response.answer },
          reason: 'Needed a separate thread for documentation',
        });
        threadChannel.members.add(message.author);
        threadChannel.send(response.answer);
        //TODO: respond to user with follow up questions here.
  }
});

const setMessageToThreads = (channelID: string, member: string, content: string) => {
  (client.channels.cache.get(channelID)as TextChannel).send(`content: ${content}`)
  //@ts-ignore
  // const thread = channel?.threads.create({
  //   name: 'docIT-question',
  //   autoArchiveDuration: 60,
  //   type: ChannelType.PrivateThread,
  //   message: { content },
  //   reason: 'Needed a separate thread for documentation',
  // });
  // thread.members.add(member)
}

const getChat = async (question: string, projectID: string): Promise<JSON | unknown> => {
  const getResponse = await axios.get(`http://localhost:3000/questions`, {data: { question, projectID }});

  return getResponse.data;
}

client.login(process.env.DISCORD_TOKEN);

//TODO: Guild = server. Create a map of each guild to route calls for specified blockchain or project :-)