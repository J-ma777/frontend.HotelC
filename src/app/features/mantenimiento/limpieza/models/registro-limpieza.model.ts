export interface RegistroLimpieza {
    id: number;
    estadoAnterior: string;
    estadoNuevo: string;
    notas?: string;
    cambiadoEn: string;
    cambiadoPor: number;
}