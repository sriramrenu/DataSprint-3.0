import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '../../registrations.csv');

class DataService {
    constructor() {
        this.initCSV();
    }

    initCSV() {
        if (!fs.existsSync(CSV_PATH)) {
            const headers = [
                'ID', 'TEAM_NAME', 'LEAD_NAME', 'EMAIL', 'PHONE', 'COLLEGE', 'DEPT', 'YEAR',
                'MEMBER_1', 'MEMBER_2', 'MEMBER_3', 'REGISTERED_AT'
            ].join(',');
            fs.writeFileSync(CSV_PATH, headers + '\n');
            console.log('📊 Registrations CSV initialized.');
        }
    }

    /**
     * Appends or updates user data in the CSV
     * For simplicity in this hackathon version, we append a new row on registration.
     * For updates, we recommend using the Download button for a fresh dump.
     */
    async logRegistration(user) {
        try {
            const row = [
                user.id,
                `"${user.teamName}"`,
                `"${user.name}"`,
                user.email,
                user.phone,
                `"${user.college}"`,
                `"${user.dept}"`,
                user.year,
                `"${user.m1Name || '---'}"`,
                `"${user.m2Name || '---'}"`,
                `"${user.m3Name || '---'}"`,
                new Date().toISOString()
            ].join(',');

            fs.appendFileSync(CSV_PATH, row + '\n');
            console.log(`✅ CSV updated for team: ${user.teamName}`);
        } catch (error) {
            console.error('❌ CSV sync error:', error);
        }
    }

    getCSVPath() {
        return CSV_PATH;
    }
}

const dataService = new DataService();
export default dataService;
