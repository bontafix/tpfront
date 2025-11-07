import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');

/**
 * Обновляет версию в package.json
 * @param {string} type - Тип обновления: 'patch', 'minor', 'major' или конкретная версия (например, '1.2.3')
 */
function updateVersion(type = 'patch') {
  try {
    // Читаем package.json
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version || '0.0.0';
    
    let newVersion;
    
    // Если передан конкретный номер версии
    if (/^\d+\.\d+\.\d+$/.test(type)) {
      newVersion = type;
    } else {
      // Парсим текущую версию
      const [major, minor, patch] = currentVersion.split('.').map(Number);
      
      switch (type) {
        case 'major':
          newVersion = `${major + 1}.0.0`;
          break;
        case 'minor':
          newVersion = `${major}.${minor + 1}.0`;
          break;
        case 'patch':
        default:
          newVersion = `${major}.${minor}.${patch + 1}`;
          break;
      }
    }
    
    // Обновляем версию
    packageJson.version = newVersion;
    
    // Записываем обратно
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    
    console.log(`✅ Версия обновлена: ${currentVersion} → ${newVersion}`);
    return newVersion;
  } catch (error) {
    console.error('❌ Ошибка при обновлении версии:', error.message);
    process.exit(1);
  }
}

// Получаем тип обновления из аргументов командной строки
const type = process.argv[2] || 'patch';
updateVersion(type);

