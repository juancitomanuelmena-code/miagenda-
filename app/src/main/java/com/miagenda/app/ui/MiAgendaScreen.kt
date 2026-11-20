package com.miagenda.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.miagenda.app.model.Actividad
import com.miagenda.app.model.Prioridad
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

enum class FiltroPrioridad(val etiqueta: String) {
    TODAS("Todas"),
    ALTA("Alta"),
    MEDIA("Media"),
    BAJA("Baja")
}

private fun obtenerFechaHoy(): String {
    val formato = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
    return formato.format(Date())
}

private fun formatearFechaPicker(millis: Long): String {
    val formato = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }
    return formato.format(Date(millis))
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MiAgendaScreen() {
    val haptics = LocalHapticFeedback.current
    // Estado en memoria: se conserva únicamente mientras la app está abierta
    var textoActividad by remember { mutableStateOf("") }
    var fechaElegida by remember { mutableStateOf<String?>(null) }
    var prioridadElegida by remember { mutableStateOf(Prioridad.MEDIA) }
    var textoBusqueda by remember { mutableStateOf("") }
    var filtroPrioridad by remember { mutableStateOf(FiltroPrioridad.TODAS) }
    var mostrarSelectorFecha by remember { mutableStateOf(false) }
    var mensajeError by remember { mutableStateOf<String?>(null) }
    var siguienteId by remember { mutableLongStateOf(1L) }
    val actividades = remember { mutableStateListOf<Actividad>() }

    val actividadesFiltradas = actividades.filter { actividad ->
        val coincideTexto = textoBusqueda.isBlank() ||
            actividad.titulo.contains(textoBusqueda.trim(), ignoreCase = true)
        val coincidePrioridad = when (filtroPrioridad) {
            FiltroPrioridad.TODAS -> true
            FiltroPrioridad.ALTA -> actividad.prioridad == Prioridad.ALTA
            FiltroPrioridad.MEDIA -> actividad.prioridad == Prioridad.MEDIA
            FiltroPrioridad.BAJA -> actividad.prioridad == Prioridad.BAJA
        }
        coincideTexto && coincidePrioridad
    }

    val datePickerState = rememberDatePickerState()

    if (mostrarSelectorFecha) {
        DatePickerDialog(
            onDismissRequest = { mostrarSelectorFecha = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        datePickerState.selectedDateMillis?.let { millis ->
                            fechaElegida = formatearFechaPicker(millis)
                        }
                        mostrarSelectorFecha = false
                    }
                ) {
                    Text("Aceptar")
                }
            },
            dismissButton = {
                TextButton(onClick = { mostrarSelectorFecha = false }) {
                    Text("Cancelar")
                }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Mi Agenda",
                        style = MaterialTheme.typography.titleLarge
                    )
                }
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .navigationBarsPadding()
                .imePadding(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                Column(modifier = Modifier.fillMaxWidth()) {
                    // 1. Campo para escribir una actividad
                    OutlinedTextField(
                        value = textoActividad,
                        onValueChange = { nuevoTexto ->
                            textoActividad = nuevoTexto
                            if (mensajeError != null && nuevoTexto.isNotBlank()) {
                                mensajeError = null
                            }
                        },
                        label = { Text("Escribe una actividad") },
                        singleLine = true,
                        isError = mensajeError != null,
                        supportingText = mensajeError?.let { error ->
                            { Text(text = error) }
                        },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // 2. Selector sencillo de fecha (opcional, por defecto hoy)
                    OutlinedButton(
                        onClick = { mostrarSelectorFecha = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CalendarToday,
                            contentDescription = null
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (fechaElegida != null) {
                                "Fecha: $fechaElegida"
                            } else {
                                "Elegir fecha (hoy: ${obtenerFechaHoy()})"
                            }
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // 3. Selector de prioridad (Baja, Media, Alta)
                    Text(
                        text = "Prioridad",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Prioridad.entries.forEach { nivel ->
                            val seleccionada = prioridadElegida == nivel
                            val colorActivo = when (nivel) {
                                Prioridad.ALTA -> Color(0xFFE11D48)
                                Prioridad.MEDIA -> Color(0xFFD97706)
                                Prioridad.BAJA -> MaterialTheme.colorScheme.primary
                            }

                            FilterChip(
                                selected = seleccionada,
                                onClick = {
                                    haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    prioridadElegida = nivel
                                },
                                label = { Text(text = nivel.etiqueta) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = colorActivo.copy(alpha = 0.14f),
                                    selectedLabelColor = colorActivo
                                ),
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // 4. Botón para agregar la actividad a la lista
                    Button(
                        onClick = {
                            val tituloLimpio = textoActividad.trim()
                            if (tituloLimpio.isEmpty()) {
                                haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                mensajeError = "Debes escribir una actividad."
                            } else {
                                haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                val fechaFinal = fechaElegida ?: obtenerFechaHoy()
                                actividades.add(
                                    Actividad(
                                        id = siguienteId++,
                                        titulo = tituloLimpio,
                                        fecha = fechaFinal,
                                        prioridad = prioridadElegida
                                    )
                                )
                                textoActividad = ""
                                fechaElegida = null
                                prioridadElegida = Prioridad.MEDIA
                                mensajeError = null
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        Text("Agregar actividad")
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider()
                    Spacer(modifier = Modifier.height(12.dp))

                    // 5. Barra de búsqueda
                    OutlinedTextField(
                        value = textoBusqueda,
                        onValueChange = { textoBusqueda = it },
                        label = { Text("Buscar actividad") },
                        singleLine = true,
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = null
                            )
                        },
                        trailingIcon = if (textoBusqueda.isNotEmpty()) {
                            {
                                IconButton(onClick = { textoBusqueda = "" }) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Limpiar búsqueda"
                                    )
                                }
                            }
                        } else null,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // 6. Selector de filtros debajo de la barra de búsqueda (Todas, Alta, Media, Baja)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        FiltroPrioridad.entries.forEach { filtro ->
                            val seleccionado = filtroPrioridad == filtro
                            FilterChip(
                                selected = seleccionado,
                                onClick = {
                                    haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    filtroPrioridad = filtro
                                },
                                label = { Text(text = filtro.etiqueta) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))
                }
            }

            // 7. Lista filtrada de actividades
            if (actividadesFiltradas.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (actividades.isEmpty()) {
                                "No hay actividades todavía. Escribe una arriba para comenzar."
                            } else {
                                "No hay actividades que coincidan con el filtro."
                            },
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                items(
                    items = actividadesFiltradas,
                    key = { it.id }
                ) { actividad ->
                    ActividadItem(
                        actividad = actividad,
                        onCambiarEstado = { marcada ->
                            haptics.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                            val indice = actividades.indexOfFirst { it.id == actividad.id }
                            if (indice != -1) {
                                actividades[indice] = actividad.copy(completada = marcada)
                            }
                        },
                        onEliminar = {
                            haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                            actividades.removeAll { it.id == actividad.id }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun ActividadItem(
    actividad: Actividad,
    onCambiarEstado: (Boolean) -> Unit,
    onEliminar: () -> Unit
) {
    val colorPrioridad = when (actividad.prioridad) {
        Prioridad.ALTA -> Color(0xFFE11D48)
        Prioridad.MEDIA -> Color(0xFFD97706)
        Prioridad.BAJA -> MaterialTheme.colorScheme.onSurfaceVariant
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = actividad.completada,
                onCheckedChange = onCambiarEstado
            )

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = actividad.titulo,
                        style = MaterialTheme.typography.bodyLarge.copy(
                            textDecoration = if (actividad.completada) {
                                TextDecoration.LineThrough
                            } else {
                                TextDecoration.None
                            }
                        ),
                        color = if (actividad.completada) {
                            MaterialTheme.colorScheme.onSurfaceVariant
                        } else {
                            MaterialTheme.colorScheme.onSurface
                        },
                        modifier = Modifier.weight(1f)
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    Text(
                        text = actividad.fecha,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = "Prioridad ${actividad.prioridad.etiqueta}",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = if (actividad.prioridad == Prioridad.ALTA) {
                        FontWeight.SemiBold
                    } else {
                        FontWeight.Medium
                    },
                    color = colorPrioridad
                )
            }

            IconButton(onClick = onEliminar) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Eliminar actividad",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun MiAgendaPreview() {
    MaterialTheme {
        MiAgendaScreen()
    }
}
