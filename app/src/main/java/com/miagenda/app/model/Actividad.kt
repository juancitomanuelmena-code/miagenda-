package com.miagenda.app.model

enum class Prioridad(val etiqueta: String) {
    BAJA("Baja"),
    MEDIA("Media"),
    ALTA("Alta")
}

/**
 * Representa una actividad simple dentro de la agenda.
 * Solo vive en memoria mientras la aplicación está abierta.
 */
data class Actividad(
    val id: Long,
    val titulo: String,
    val fecha: String,
    val prioridad: Prioridad = Prioridad.MEDIA,
    val completada: Boolean = false
)
