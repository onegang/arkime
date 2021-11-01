import Observable from './Observable';

export default {
  /**
   * Decodes an array of 8-bit unsigned integers into text
   * TODO document */
  decoder (arr) {
    const dec = new TextDecoder('utf-8');
    return dec.decode(arr);
  },

  /** TODO document */
  sendChunk (subscriber, chunk) {
    try { // try to parse and send the chunk
      const json = JSON.parse(chunk);
      subscriber.next(json);
    } catch (err) {
      subscriber.error(`ERROR: ${err} - ${chunk}`);
      return subscriber.complete();
    }
  },

  /**
   * Gets stuff
   * TODO document
   */
  search (searchTerm) {
    return new Observable((subscriber) => {
      searchTerm = searchTerm.trim();

      if (!searchTerm) { // nothing to do
        return subscriber.complete();
      }

      fetch(`api/integration/search/${searchTerm}`).then((response) => {
        if (!response.ok) { // test for bad response code (only on first chunk)
          throw new Error(response.statusText);
        }
        return response.body;
      }).then((rStream) => {
        const reader = rStream.getReader();
        const sendChunk = this.sendChunk;
        const decoder = this.decoder;

        return new ReadableStream({
          start () {
            let remaining = '';

            function read () { // handle each data chunk
              reader.read().then(({ done, value }) => {
                if (done) { // stream is done
                  return subscriber.complete();
                }

                remaining += decoder(value);

                let pos = 0;
                while ((pos = remaining.indexOf('\n')) > -1) {
                  sendChunk(subscriber, remaining.slice(0, pos));
                  // keep the rest because it may not be complete
                  remaining = remaining.slice(pos + 1, remaining.length);
                }

                if (remaining) {
                  sendChunk(subscriber, remaining);
                }

                read(); // keep reading until done
              });
            }

            read();
          }
        });
      }).catch((err) => { // this catches an issue with in the ^ .then
        subscriber.error(err);
        return subscriber.complete();
      });
    });
  }
};
