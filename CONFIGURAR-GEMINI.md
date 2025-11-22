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

### Error: "API key not valid. Please pass a valid API key"

**Este error significa que tu API key no es válida.** Sigue estos pasos:

1. **Obtén una nueva API key:**
   - Ve a [Google AI Studio](https://aistudio.google.com/apikey)
   - Si ya tienes una API key, puedes crear una nueva o verificar la existente
   - Asegúrate de copiar la API key completa (debe empezar con `AIzaSy`)

2. **Actualiza el archivo `.env`:**
   - Abre el archivo `.env` en la raíz del proyecto
   - Reemplaza el valor de `VITE_GEMINI_API_KEY` con tu nueva API key
   - Asegúrate de que NO haya espacios antes o después del `=`
   - El formato correcto es: `VITE_GEMINI_API_KEY=AIzaSy...` (sin comillas)

3. **Reinicia el servidor:**
   - Detén el servidor (Ctrl + C)
   - Inicia de nuevo: `npm run dev`

4. **Verifica:**
   - Abre la consola del navegador (F12)
   - Busca mensajes de error o éxito
   - Si el error persiste, verifica que la API key esté activa en Google AI Studio

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
1. `gemini-2.0-flash-exp` (Gemini 2.5 Flash - modelo más reciente y recomendado)
2. `gemini-2.0-flash` (Gemini 2.0 Flash)
3. `gemini-1.5-flash` (fallback - modelo anterior)
4. `gemini-1.5-pro` (fallback - más potente)
5. `gemini-pro` (fallback - modelo clásico)

## 📝 Notas Importantes

- El archivo `.env` NO debe subirse a Git (ya está en `.gitignore`)
- La API key es personal y no debe compartirse
- Si cambias la API key, reinicia el servidor de desarrollo
- Los modelos pueden tener límites de uso según tu plan de Google

## 🔗 Enlaces Útiles

- [Google AI Studio](https://aistudio.google.com/apikey) - Obtener API key
- [Documentación de Gemini](https://ai.google.dev/docs) - Documentación oficial

