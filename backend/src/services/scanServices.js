const callAIModel = async (file) => {
  if (!process.env.AI_SCAN_URL) {
    const error = new Error('AI_SCAN_URL belum dikonfigurasi')
    error.statusCode = 500
    throw error
  }

  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, 15000)

  try {
    const formData = new FormData()

    const blob = new Blob([file.buffer], {
      type: file.mimetype,
    })

    formData.append('image', blob, file.originalname)

    const response = await fetch(
      process.env.AI_SCAN_URL.trim(),
      {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      }
    )

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text()

      const error = new Error(`AI service gagal memproses gambar: ${errorText}`)
      error.statusCode = 502
      throw error
    }

    return await response.json()
  } catch (err) {
    clearTimeout(timeout)

    const error = new Error(
      err.name === 'AbortError'
        ? 'AI service timeout saat memproses gambar'
        : err.message || 'AI service tidak dapat diakses'
    )

    error.statusCode = err.statusCode || 502
    throw error
  }
}

const normalizePredictions = (topPredictions = []) => {
  if (!Array.isArray(topPredictions)) {
    return []
  }

  return topPredictions.map((item) => ({
    label: item.label || 'Unknown',
    confidence: Number(item.confidence || 0),
    percent: Number(((item.confidence || 0) * 100).toFixed(2)),
  }))
}

export const scanFoodService = async (file) => {
  if (!file) {
    const error = new Error('Gambar wajib diupload')
    error.statusCode = 400
    throw error
  }

  const aiResult = await callAIModel(file)

  return {
    image: {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    },

    detected_food: aiResult.detected_food || null,
    category: aiResult.category || null,
    confidence: Number(aiResult.confidence || 0),

    is_low_confidence: Boolean(aiResult.is_low_confidence),
    needs_review: Boolean(aiResult.needs_review),
    confidence_threshold: Number(aiResult.confidence_threshold || 0),

    source: aiResult.source || 'tensorflow_vision_model',

    estimated_shelf_life_days:
      aiResult.estimated_shelf_life_days
        ? Number(aiResult.estimated_shelf_life_days)
        : null,

    risk_label: aiResult.risk_label || null,

    storage_advice: aiResult.storage_advice || null,

    recommendations: Array.isArray(aiResult.recommendations)
      ? aiResult.recommendations
      : [],

    top_predictions: normalizePredictions(
      aiResult.top_predictions
    ),
  }
}