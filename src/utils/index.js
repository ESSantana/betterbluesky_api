export function getHashtags(texto) {
  const regex = /#\w+/g;
  return texto.match(regex) || [];
}

export function mergeArray(arrayA, arrayB) {
  const result = [];
  const maxLength = Math.max(arrayA.length, arrayB.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < arrayA.length) {
      result.push(arrayA[i]);
    }
    if (i < arrayB.length) {
      result.push(arrayB[i]);
    }
  }

  return result;
}

export function removeDuplicate(trends) {
  const wordMap = new Map();

  trends.forEach(({ text, count, timefilter }) => {
    const lowerCaseText = text.toLowerCase();

    if (wordMap.has(lowerCaseText)) {
      wordMap.set(lowerCaseText, {
        text: wordMap.get(lowerCaseText).text,
        count: wordMap.get(lowerCaseText).count + count,
        timefilter: wordMap.get(lowerCaseText).timefilter,
      });
    } else {
      wordMap.set(lowerCaseText, { text, count, timefilter });
    }
  });

  return Array.from(wordMap.values());
}
