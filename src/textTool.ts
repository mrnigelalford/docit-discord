import natural from 'natural';
const tokenizer = new natural.SentenceTokenizer();

const splitIntoMarkdownParagraphs = (text) => {
  // Check if the input is a string
  console.log('text: ', text);
  if (typeof text !== 'string') {
    throw new TypeError('The provided input is not a string.');
  }

  const sentences = tokenizer.tokenize(text);
  const paragraphs = [];
  let currentParagraph = [];

  sentences.forEach((sentence, idx) => {
    currentParagraph.push(sentence);

    // Check for logical breaks or if we've reached the end of the text.
    if (sentence.endsWith('.') || idx === sentences.length - 1) {
      paragraphs.push(currentParagraph.join(' '));
      currentParagraph = [];
    }
  });

  return paragraphs.filter(paragraph => paragraph.trim().length > 0).join('\n\n');
}

export default splitIntoMarkdownParagraphs;