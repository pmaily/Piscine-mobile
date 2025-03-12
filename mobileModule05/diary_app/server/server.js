const express = require('express');
const app = express();
const port = 3000;

const expoRedirectUrl = process.argv[2] || 'exp://r_sj3nk-pmailly-8081.exp.direct';

app.get('/redirect', (req, res) => {
	const { code, state } = req.query;
	const redirectUrl = `${expoRedirectUrl}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
	res.redirect(redirectUrl);
});

app.listen(port, () => {
	console.log(`Serveur démarré sur http://localhost:${port}`);
});
