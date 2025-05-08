import { Sequelize } from "sequelize";
import { Website } from "./Website.js";
import { Keyword } from "./Keyword.js";
import { WebsiteKeyword } from "./WebsiteKeyword.js";
import { TopSite, initTopSite } from "./TopSite.js";

// Sjekker om nødvendige miljøvariabler for databasen er satt, ellers kastes en feil
if (!process.env.DB_NAME || !process.env.DB_USER) {
  throw new Error("Database configuration missing in environment variables");
}

// Oppretter en Sequelize-instans som kobler til PostgreSQL-databasen med konfigurasjonen
const sequelize = new Sequelize({
  database: process.env.DB_NAME,  // Navnet på databasen
  username: process.env.DB_USER,  // Brukernavn for databasen
  password: process.env.DB_PASSWORD,  // Passord for databasen
  host: process.env.DB_HOST,  // Host for databasen
  port: Number(process.env.DB_PORT),  // Portnummer for tilkobling til databasen
  dialect: "postgres",  // Bruker PostgreSQL som database
  dialectOptions: {
    ssl: false,  // Deaktiver SSL
  },
  logging: false,  // Slår av logging av SQL-spørringer
});

// Initialiserer modellene ved å sende `sequelize`-instansen
Website.initializeModel(sequelize);
Keyword.initializeModel(sequelize);
WebsiteKeyword.initializeModel(sequelize);
initTopSite(sequelize);

// Definerer relasjoner mellom modellene

// Mange-til-mange-relasjon mellom Website og Keyword via WebsiteKeyword
Website.belongsToMany(Keyword, {
  through: WebsiteKeyword,  // Bruker WebsiteKeyword som mellomliggende tabell
  foreignKey: "website_id",  // Fremmednøkkel til Website
  otherKey: "keyword_id",  // Fremmednøkkel til Keyword
});

// Mange-til-mange-relasjon mellom Keyword og Website via WebsiteKeyword
Keyword.belongsToMany(Website, {
  through: WebsiteKeyword,  // Bruker WebsiteKeyword som mellomliggende tabell
  foreignKey: "keyword_id",  // Fremmednøkkel til Keyword
  otherKey: "website_id",  // Fremmednøkkel til Website
});

// Definerer en en-til-en-relasjon mellom WebsiteKeyword og Keyword
WebsiteKeyword.belongsTo(Keyword, {
  foreignKey: "keyword_id",  // Fremmednøkkel til Keyword
  as: "Keyword",  // Alias for relasjonen
});

// Definerer en en-til-en-relasjon mellom WebsiteKeyword og Website
WebsiteKeyword.belongsTo(Website, {
  foreignKey: "website_id",  // Fremmednøkkel til Website
  as: "Website",  // Alias for relasjonen
});

// Eksporterer Sequelize-instansen og modellene for bruk i andre deler av applikasjonen
export { sequelize, Website, Keyword, WebsiteKeyword, TopSite };
