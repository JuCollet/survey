const axios = require("axios");
const HtmlDiffer = require("html-differ").HtmlDiffer;
const { sendMail } = require("./mail");
const config = require("./config");

var options = {
  ignoreAttributes: [],
  compareAttributesAsJSON: [],
  ignoreWhitespaces: true,
  ignoreComments: true,
  ignoreEndTags: false,
  ignoreDuplicateAttributes: false,
};

var htmlDiffer = new HtmlDiffer(options);

const survey = (function () {
  const content = {};

  const launch = async () => {
    const urls = config.urls;

    try {
      const fetched = await Promise.all(urls.map((url) => axios.get(url)));
      const res = fetched.map(({ data, config: { url } }) => ({
        html: data,
        url,
      }));
      res.forEach((result) => {
        if (!content[result.url]) {
          content[result.url] = result.html;
          console.log(
            "Premier résultat enregistré pour",
            result.url,
            "à",
            new Date().toLocaleString()
          );
          return true;
        }

        if (!htmlDiffer.isEqual(result.html, content[result.url])) {
          content[result.url] = result.html;
          console.log(
            "Changement détecté pour",
            result.url,
            "à",
            new Date().toLocaleString()
          );

          sendMail({
            url: result.url,
            changes: htmlDiffer.diffHtml(content[result.url], result.html),
          });
        } else {
          console.log(
            "Aucun changenement pour",
            result.url,
            "à",
            new Date().toLocaleString()
          );
        }
      });
    } catch ({ error }) {
      sendMail({ error });
      process.exit();
    }

    setTimeout(launch, config.delay);
  };

  return {
    launch,
  };
})();

survey.launch();
