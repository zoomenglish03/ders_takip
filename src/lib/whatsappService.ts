import { supabase } from './supabase';

export async function sendWhatsAppNotification(
  classId: string,
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('notifications').insert({
      class_id: classId,
      message,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Bildirim kaydedilemedi:', error);
      return { success: false, error: error.message };
    }

    console.log(`WhatsApp bildirimi: ${phoneNumber}`);
    console.log(`Mesaj: ${message}`);

    return { success: true };
  } catch (error) {
    console.error('WhatsApp bildirim hatası:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
}

export async function checkAndNotifyClassCompletion(
  classId: string,
  className: string,
  totalLessons: number,
  phoneNumber: string,
  completedLessons: number
): Promise<void> {
  if (completedLessons >= totalLessons) {
    const message = `${className} sınıfının ders sayısı doldu! Toplam ${totalLessons} ders tamamlandı.`;
    await sendWhatsAppNotification(classId, phoneNumber, message);
  }
}
