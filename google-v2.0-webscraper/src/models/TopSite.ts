import { Model, DataTypes } from "sequelize";
import type { Sequelize } from "sequelize";

// Definerer 'TopSite' modellen som en subklasse av Sequelize's 'Model' klasse
export class TopSite extends Model {
  declare id: string; // Unik identifikator
  declare url: string; // Nettadresse til nettstedet
  declare rank: number; // Rangering av nettstedet
  declare scraped: boolean; // Indikerer om nettstedet er skrapt
  declare attempt_count: number; // Antall forsøk på å skrape nettstedet
  declare next_attempt: Date | null; // Tidspunkt for neste forsøk på skraping
  declare last_error: string | null; // Beskrivelse av siste feil ved skraping
}

// Initialiserer 'TopSite' modellen med nødvendige felter og konfigurasjoner
export function initTopSite(sequelize: Sequelize) {
  TopSite.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true, // Angir at id er primærnøkkel
      },
      url: {
        type: DataTypes.STRING(2048),
        unique: true, // Unik URL for hvert nettsted
        allowNull: false, // URL må ikke være null
      },
      rank: {
        type: DataTypes.INTEGER,
        allowNull: false, // Rangering kan ikke være null
      },
      scraped: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Standardverdi for scraped er false
      },
      attempt_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // Standardverdi for attempt_count er 0
      },
      next_attempt: {
        type: DataTypes.DATE,
        allowNull: true, // Kan være null hvis ingen dato er spesifisert
      },
      last_error: {
        type: DataTypes.TEXT,
        allowNull: true, // Kan være null hvis ingen feil har oppstått
      },
    },
    {
      sequelize, // Knytter modellen til en Sequelize-instans
      modelName: "top_site", // Navnet på modellen
      tableName: "top_sites", // Navnet på tabellen i databasen
      timestamps: false, // Deaktiverer automatisk tidspunktsregistrering
    }
  );
}
