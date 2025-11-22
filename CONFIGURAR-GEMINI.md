# 🔧 Configurar Gemini API para el Asistente IA

## Pasos para Configurar

### 1. Obtener tu API Key de Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key" o "Get API Key"
4. Copia tu API key (tendrá un formato como: `AIzaSy...`)

### 2. Crear archivo `.env`

En la raíz del proyecto, crea un archivo llamado `.env` con el siguiente contenido:

```env
VITE_GEMINI_API_KEY=tu_api_key_aqui
```

**Ejemplo:**
```env
VITE_GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

### 3. Reiniciar el servidor de desarrollo

Después de crear el archivo `.env`, **debes reiniciar el servidor de desarrollo**:

```bash
# Detén el servidor (Ctrl + C)
# Luego inicia de nuevo:
npm run dev
```

## ⚠️ Solución de Problemas

### Error: "El modelo de IA no está disponible con tu API key"

**Posibles causas:**
1. **API Key no configurada**: Asegúrate de que el archivo `.env` existe y tiene la variable `VITE_GEMINI_API_KEY`
2. **API Key inválida**: Verifica que copiaste correctamente la API key desde Google AI Studio
3. **Servidor no reiniciado**: Después de crear/modificar `.env`, siempre reinicia el servidor
4. **API Key sin permisos**: Asegúrate de que tu API key tenga acceso a los modelos de Gemini

### Verificar que la API Key funciona

1. Abre la consola del navegador (F12)
2. Busca mensajes que digan "✅ Modelo X disponible" o "⚠️ Modelo X falló"
3. Si todos los modelos fallan, verifica tu API key en Google AI Studio

### Modelos disponibles

El sistema intentará usar estos modelos en orden:
1. `gemini-1.5-flash` (recomendado - más rápido)
2. `gemini-1.5-pro` (más potente)
3. `gemini-pro` (modelo clásico)

## 📝 Notas Importantes

- El archivo `.env` NO debe subirse a Git (ya está en `.gitignore`)
- La API key es personal y no debe compartirse
- Si cambias la API key, reinicia el servidor de desarrollo
- Los modelos pueden tener límites de uso según tu plan de Google

## 🔗 Enlaces Útiles

- [Google AI Studio](https://aistudio.google.com/apikey) - Obtener API key
- [Documentación de Gemini](https://ai.google.dev/docs) - Documentación oficial

