const nodemailer = require("nodemailer");
const config = require("./config.json");

const sendMail = async ({ url, changes, error }) => {
  let transporter = nodemailer.createTransport({
    host: "in-v3.mailjet.com",
    port: 587,
    secure: false,
    auth: {
      user: config.mailJet.user,
      pass: config.mailJet.password,
    },
  });

  const formattedChanges = !changes
    ? ""
    : `
        <h2>Changements</h2>
        ${changes.reduce((acc, curr) => {
          const color = curr.added ? "lime" : curr.removed ? "red" : "grey";
          return `${acc}<span style="color: ${color};">${curr.value}</span>`;
        }, "")}
        `;

  if (error) {
    await transporter.sendMail({
      from: config.mailJet.from,
      to: confif.mailJet.to,
      subject: "Une erreur s'est produite durant la surveillance",
      html: `
          <h1>Une erreur s'est produite</h1>
          <p>Date de l'erreur : ${new Date().toLocaleString()}</p>
          <p>${JSON.stringify(error)}</p>
          `,
    });
    return false;
  }

  const infos = await transporter.sendMail({
    from: config.mailJet.from,
    to: config.mailJet.to,
    subject: "Une modification a été détectée sur " + url,
    html: `
        <h1>Une modification a été détectée</h1>
        <p>Modification détectée sur <b>${url}</b> à ${new Date().toLocaleString()}</p>
        ${formattedChanges}
        `,
  });
  infos.accepted.forEach((email) => {
    console.log("Email envoyée à" + email);
  });
};

module.exports = {
  sendMail,
};
