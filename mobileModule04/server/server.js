const express = require('express');
const app = express();
const port = 3000;

const GOOGLE_CLIENT_ID = "188341974524-opv42atf95tnuk83jch9mcvaqg6jtmpk.apps.googleusercontent.com";

app.get('/redirect', (req, res) => {
	const { code, state } = req.query;
	console.log('Paramètres de la requête:', req.query);
	// const id = fetchGoogleIdToken(code);
	// id.then((id) => {console.log("id", id)});
	const expoRedirectUrl = `exp://r_sj3nk-pmailly-8081.exp.direct?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
	res.redirect(expoRedirectUrl);
});

app.listen(port, () => {
	console.log(`Serveur démarré sur http://localhost:${port}`);
});