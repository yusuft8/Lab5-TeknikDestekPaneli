import React, { useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  StatusBar,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions
} from 'react-native';

import {
  SafeAreaProvider,
  SafeAreaView
} from 'react-native-safe-area-context';

// 1. SABİT DEĞERLER

const KATEGORILER = [
  'Bilgisayar',
  'Yazıcı',
  'İnternet',
  'Yazılım',
  'Donanım'
];

const DURUMLAR = [
  'Bekliyor',
  'İşlemde',
  'Tamamlandı'
];

const FILTRELER = [
  'Tümü',
  ...DURUMLAR
];

// Yeni talepler TLP-1009'dan başlar ve her kayıtta bir artar.
const BASLANGIC_ID = 1009;

// 2. ÖRNEK TALEP VERİLERİ

const baslangicTalepleri = [
  {
    id: 'TLP-1001',
    baslik: 'Bilgisayar açılmıyor',
    aciklama:
      'Öğrenci işleri birimindeki masaüstü bilgisayar güç düğmesine basıldığında açılmıyor. Fiş ve priz kontrol edildi, sorun devam ediyor.',
    kategori: 'Bilgisayar',
    birim: 'Öğrenci İşleri',
    oncelik: 'Yüksek',
    durum: 'Bekliyor',
    eklenmeTarihi: '2026-10-12'
  },
  {
    id: 'TLP-1002',
    baslik: 'Yazıcı bağlantı sorunu',
    aciklama:
      'Personel daire başkanlığındaki ağ yazıcısına gönderilen belgeler yazdırma kuyruğunda bekliyor. Yazıcı çevrimdışı görünüyor.',
    kategori: 'Yazıcı',
    birim: 'Personel Daire Başkanlığı',
    oncelik: 'Orta',
    durum: 'İşlemde',
    eklenmeTarihi: '2026-10-13'
  },
  {
    id: 'TLP-1003',
    baslik: 'İnternet bağlantısı kesildi',
    aciklama:
      'Kütüphane okuma salonundaki kablolu ağ bağlantısı sabah saatlerinden itibaren çalışmıyor. Kabloyu değiştirdim, sonuç aynı.',
    kategori: 'İnternet',
    birim: 'Kütüphane',
    oncelik: 'Yüksek',
    durum: 'Bekliyor',
    eklenmeTarihi: '2026-10-13'
  },
  {
    id: 'TLP-1004',
    baslik: 'Ofis yazılımı hata veriyor',
    aciklama:
      'Muhasebe biriminde kullanılan ofis yazılımı açılırken lisans hatası veriyor. Bilgisayar yeniden başlatıldı, hata tekrarlandı.',
    kategori: 'Yazılım',
    birim: 'Muhasebe',
    oncelik: 'Düşük',
    durum: 'Tamamlandı',
    eklenmeTarihi: '2026-10-14'
  },
  {
    id: 'TLP-1005',
    baslik: 'Bilgisayar çok yavaş',
    aciklama:
      'Mühendislik fakültesi laboratuvarındaki bilgisayar açılışta ve dosya açarken aşırı yavaşlıyor. Disk kullanımı sürekli yüzde yüz görünüyor.',
    kategori: 'Bilgisayar',
    birim: 'Mühendislik Fakültesi',
    oncelik: 'Orta',
    durum: 'İşlemde',
    eklenmeTarihi: '2026-10-14'
  },
  {
    id: 'TLP-1006',
    baslik: 'Yazıcı kağıt sıkıştırıyor',
    aciklama:
      'Rektörlük katındaki yazıcı her baskıda kağıdı sıkıştırıyor. Kağıt tepsisindeki kağıtlar düzeltildi ancak sorun sürüyor.',
    kategori: 'Yazıcı',
    birim: 'Rektörlük',
    oncelik: 'Düşük',
    durum: 'Tamamlandı',
    eklenmeTarihi: '2026-10-15'
  },
  {
    id: 'TLP-1007',
    baslik: 'Kablosuz ağ çalışmıyor',
    aciklama:
      'Merkezi dersliklerde kablosuz ağa bağlanılamıyor. Telefon ve dizüstü bilgisayarda aynı sorun yaşanıyor, ağ görünmüyor.',
    kategori: 'İnternet',
    birim: 'Merkezi Derslikler',
    oncelik: 'Yüksek',
    durum: 'Bekliyor',
    eklenmeTarihi: '2026-10-15'
  },
  {
    id: 'TLP-1008',
    baslik: 'Program lisans sorunu',
    aciklama:
      'Bilgi işlem birimindeki tasarım programı lisans süresi doldu uyarısı veriyor. Program açılmıyor, lisans yenilenmesi gerekiyor.',
    kategori: 'Yazılım',
    birim: 'Bilgi İşlem',
    oncelik: 'Orta',
    durum: 'İşlemde',
    eklenmeTarihi: '2026-10-16'
  }
];

// 3. YARDIMCI FONKSİYONLAR

const oncelikRengi = (oncelik) => {
  if (oncelik === 'Yüksek') return '#dc2626';
  if (oncelik === 'Orta') return '#d97706';
  return '#16a34a';
};

const durumRengi = (durum) => {
  if (durum === 'Bekliyor') return '#dc2626';
  if (durum === 'İşlemde') return '#d97706';
  return '#16a34a';
};

const tarihYaz = (tarih) => {
  if (!tarih) return '—';

  const deger = new Date(tarih);

  if (Number.isNaN(deger.getTime())) return '—';

  const gun = String(deger.getDate()).padStart(2, '0');
  const ay = String(deger.getMonth() + 1).padStart(2, '0');

  return `${gun}.${ay}.${deger.getFullYear()}`;
};

const bildirimRengi = (tur) => {
  if (tur === 'hata') return '#b91c1c';
  if (tur === 'bilgi') return '#0f1e33';
  return '#15803d';
};

const bildirimIkonu = (tur) => {
  if (tur === 'hata') return '!';
  if (tur === 'bilgi') return 'i';
  return '✓';
};

// 4. ÖZET KARTI BİLEŞENİ

function OzetKarti({
  baslik,
  sayi,
  renk,
  genislik
}) {
  return (
    <View
      style={[
        styles.summaryCard,
        { width: genislik }
      ]}
    >
      <View
        style={[
          styles.summaryIndicator,
          { backgroundColor: renk }
        ]}
      />

      <Text
        style={[
          styles.summaryNumber,
          { color: renk }
        ]}
      >
        {sayi}
      </Text>

      <Text style={styles.summaryLabel}>
        {baslik}
      </Text>
    </View>
  );
}

// 5. TALEP KARTI BİLEŞENİ
// Kısa dokunma detayı açar, uzun basma silme onayını açar.

function TalepKarti({
  talep,
  onAc,
  onUzunBas
}) {
  return (
    <Pressable
      onPress={() => onAc(talep.id)}
      onLongPress={() => onUzunBas(talep.id)}
      delayLongPress={450}
      android_ripple={{ color: '#e2e8f0' }}
      accessibilityRole="button"
      accessibilityLabel={`${talep.baslik}. Detay için dokunun, silmek için uzun basın.`}
      accessibilityHint="Detayı açar"
      style={({ pressed }) => [
        styles.ticketCard,
        { borderLeftColor: durumRengi(talep.durum) },
        pressed && styles.ticketCardPressed
      ]}
    >
      {/* ÜST SATIR */}
      <View style={styles.ticketTop}>

        <Text style={styles.ticketId}>
          {talep.id}
        </Text>

        <View
          style={[
            styles.priorityBadge,
            {
              backgroundColor:
                oncelikRengi(talep.oncelik) + '18'
            }
          ]}
        >
          <Text
            style={[
              styles.priorityText,
              { color: oncelikRengi(talep.oncelik) }
            ]}
          >
            {talep.oncelik}
          </Text>
        </View>

      </View>

      {/* ARIZA BAŞLIĞI */}
      <Text style={styles.ticketTitle}>
        {talep.baslik}
      </Text>

      {/* AÇIKLAMA ÖNİZLEMESİ */}
      <Text
        style={styles.ticketDescription}
        numberOfLines={2}
      >
        {talep.aciklama}
      </Text>

      {/* KATEGORİ VE BİRİM */}
      <Text style={styles.ticketDetail}>
        {talep.birim
          ? `${talep.kategori} • ${talep.birim}`
          : talep.kategori}
      </Text>

      {/* ALT SATIR */}
      <View style={styles.ticketBottom}>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                durumRengi(talep.durum) + '18'
            }
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: durumRengi(talep.durum) }
            ]}
          >
            {talep.durum}
          </Text>
        </View>

        <Text style={styles.ticketDate}>
          {tarihYaz(talep.eklenmeTarihi)}
        </Text>

      </View>
    </Pressable>
  );
}

// 6. ANA YÖNETİM PANELİ

function TeknikDestekPaneli() {

  // LİSTE STATE'İ
  const [talepler, setTalepler] = useState(
    baslangicTalepleri
  );

  const [aktifFiltre, setAktifFiltre] = useState('Tümü');

  // FORM STATE'İ — G1: değerler state'te tutulur.
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [kategori, setKategori] = useState(KATEGORILER[0]);
  const [hatalar, setHatalar] = useState({
    baslik: null,
    aciklama: null
  });

  // MODAL STATE'İ
  const [seciliId, setSeciliId] = useState(null);
  const [silinecekId, setSilinecekId] = useState(null);

  // BİLDİRİM STATE'İ — G8
  const [bildirim, setBildirim] = useState(null);

  // BENZERSİZ ID SAYACI — G4
  const sonrakiId = useRef(BASLANGIC_ID);

  // EKRAN BOYUTLARI
  const { width } = useWindowDimensions();

  const sutunSayisi = width >= 600 ? 4 : 2;

  const kartGenisligi =
    (width - 32 - (sutunSayisi - 1) * 10)
    / sutunSayisi;

  // BİLDİRİMİ OTOMATİK KAPAT
  useEffect(() => {
    if (!bildirim) return undefined;

    const zamanlayici = setTimeout(() => {
      setBildirim(null);
    }, 3000);

    return () => clearTimeout(zamanlayici);
  }, [bildirim]);

  const bildir = (mesaj, tur = 'basari') => {
    setBildirim({
      mesaj,
      tur,
      anahtar: Date.now()
    });
  };

  // TALEP SAYILARI
  const toplam = talepler.length;

  const bekleyen = talepler.filter(
    item => item.durum === 'Bekliyor'
  ).length;

  const islemde = talepler.filter(
    item => item.durum === 'İşlemde'
  ).length;

  const tamamlanan = talepler.filter(
    item => item.durum === 'Tamamlandı'
  ).length;

  // FİLTRELEME
  const filtreliTalepler = talepler.filter((item) => {
    if (aktifFiltre === 'Tümü') {
      return true;
    }

    return item.durum === aktifFiltre;
  });

  // SEÇİLİ VE SİLİNECEK KAYITLAR
  const seciliTalep = seciliId
    ? talepler.find(item => item.id === seciliId)
    : null;

  const silinecekTalep = silinecekId
    ? talepler.find(item => item.id === silinecekId)
    : null;

  // G3: DOĞRULAMA + G4: KAYIT EKLEME
  const talepKaydet = () => {

    const temizBaslik = baslik.trim();
    const temizAciklama = aciklama.trim();

    const yeniHatalar = {
      baslik: temizBaslik.length === 0
        ? 'Talep başlığı boş bırakılamaz.'
        : null,
      aciklama: temizAciklama.length === 0
        ? 'Arıza açıklaması boş bırakılamaz.'
        : null
    };

    setHatalar(yeniHatalar);

    if (yeniHatalar.baslik || yeniHatalar.aciklama) {
      bildir(
        'Talep kaydedilemedi. Başlık ve açıklama zorunludur.',
        'hata'
      );
      return;
    }

    const yeniTalep = {
      id: `TLP-${sonrakiId.current}`,
      baslik: temizBaslik,
      aciklama: temizAciklama,
      kategori,
      oncelik: 'Orta',
      durum: 'Bekliyor',
      eklenmeTarihi: new Date().toISOString()
    };

    sonrakiId.current += 1;

    setTalepler(oncekiTalepler => [
      yeniTalep,
      ...oncekiTalepler
    ]);

    // Formu temizle
    setBaslik('');
    setAciklama('');
    setHatalar({ baslik: null, aciklama: null });
    setAktifFiltre('Tümü');

    bildir(
      `${yeniTalep.id} numaralı talep oluşturuldu.`,
      'basari'
    );
  };

  const formuTemizle = () => {
    setBaslik('');
    setAciklama('');
    setKategori(KATEGORILER[0]);
    setHatalar({ baslik: null, aciklama: null });
    bildir('Form temizlendi.', 'bilgi');
  };

  // G7: DURUM GÜNCELLEME
  const durumDegistir = (id, yeniDurum) => {

    setTalepler(oncekiTalepler =>
      oncekiTalepler.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          durum: yeniDurum
        };
      })
    );

    bildir(
      `Durum "${yeniDurum}" olarak güncellendi.`,
      'bilgi'
    );
  };

  // G6: SİLME
  const silmeyiOnayla = () => {

    if (!silinecekTalep) return;

    const silinen = silinecekTalep;

    setTalepler(oncekiTalepler =>
      oncekiTalepler.filter(item => item.id !== silinen.id)
    );

    if (seciliId === silinen.id) {
      setSeciliId(null);
    }

    setSilinecekId(null);

    bildir(
      `${silinen.id} numaralı talep silindi.`,
      'basari'
    );
  };

  const silmeyiVazgec = () => {
    setSilinecekId(null);
    bildir('Silme işlemi iptal edildi.', 'bilgi');
  };

  // LİSTE ÜST ALANI

  const listeBasligi = (
    <View>

      {/* PANEL BAŞLIĞI */}
      <View style={styles.header}>

        <Text style={styles.headerLabel}>
          BİLGİ İŞLEM DAİRE BAŞKANLIĞI
        </Text>

        <Text style={styles.title}>
          Teknik Destek Paneli
        </Text>

        <Text style={styles.subtitle}>
          Destek taleplerini buradan yönetin.
        </Text>

      </View>

      {/* ÖZET KARTLARI */}
      <View style={styles.summaryGrid}>

        <OzetKarti
          baslik="Toplam Talep"
          sayi={toplam}
          renk="#2563eb"
          genislik={kartGenisligi}
        />

        <OzetKarti
          baslik="Bekliyor"
          sayi={bekleyen}
          renk="#dc2626"
          genislik={kartGenisligi}
        />

        <OzetKarti
          baslik="İşlemde"
          sayi={islemde}
          renk="#d97706"
          genislik={kartGenisligi}
        />

        <OzetKarti
          baslik="Tamamlanan"
          sayi={tamamlanan}
          renk="#16a34a"
          genislik={kartGenisligi}
        />

      </View>

      {/* YENİ TALEP FORMU — G1, G2, G3 */}
      <View style={styles.formCard}>

        <View style={styles.formHeaderRow}>

          <View style={styles.formHeaderLeft}>
            <Text style={styles.formTitle}>
              Yeni Talep Oluştur
            </Text>
            <Text style={styles.formSubtitle}>
              Arıza bilgilerini girip talebi kaydedin.
            </Text>
          </View>

          <View style={styles.formBadge}>
            <Text style={styles.formBadgeText}>
              YENİ
            </Text>
          </View>

        </View>

        {/* BAŞLIK */}
        <Text style={styles.inputLabel}>
          Talep Başlığı
          <Text style={styles.requiredLabel}> *</Text>
        </Text>

        <TextInput
          value={baslik}
          onChangeText={(metin) => {
            setBaslik(metin);

            if (hatalar.baslik) {
              setHatalar(onceki => ({
                ...onceki,
                baslik: null
              }));
            }
          }}
          placeholder="Örn. Toplantı odasındaki projeksiyon açılmıyor"
          placeholderTextColor="#94a3b8"
          maxLength={80}
          style={[
            styles.input,
            hatalar.baslik && styles.inputHatali
          ]}
          returnKeyType="next"
        />

        <View style={styles.inputMetaRow}>
          {hatalar.baslik ? (
            <Text style={styles.hataText}>
              {hatalar.baslik}
            </Text>
          ) : (
            <Text style={styles.yardimText}>
              Kısa ve anlaşılır bir başlık yazın.
            </Text>
          )}

          <Text style={styles.karakterSayaci}>
            {baslik.length}/80
          </Text>
        </View>

        {/* AÇIKLAMA */}
        <Text style={styles.inputLabel}>
          Arıza Açıklaması
          <Text style={styles.requiredLabel}> *</Text>
        </Text>

        <TextInput
          value={aciklama}
          onChangeText={(metin) => {
            setAciklama(metin);

            if (hatalar.aciklama) {
              setHatalar(onceki => ({
                ...onceki,
                aciklama: null
              }));
            }
          }}
          placeholder="Sorunun nerede ve ne zaman yaşandığını kısaca anlatın."
          placeholderTextColor="#94a3b8"
          maxLength={400}
          multiline
          style={[
            styles.input,
            styles.inputCokSatir,
            hatalar.aciklama && styles.inputHatali
          ]}
          textAlignVertical="top"
        />

        <View style={styles.inputMetaRow}>
          {hatalar.aciklama ? (
            <Text style={styles.hataText}>
              {hatalar.aciklama}
            </Text>
          ) : (
            <Text style={styles.yardimText}>
              En az bir cümle yazmanız yeterli.
            </Text>
          )}

          <Text style={styles.karakterSayaci}>
            {aciklama.length}/400
          </Text>
        </View>

        {/* KATEGORİ — G2 */}
        <Text style={styles.inputLabel}>
          Arıza Kategorisi
        </Text>

        <View style={styles.kategoriSatiri}>
          {KATEGORILER.map((secenek) => {
            const secili = kategori === secenek;

            return (
              <Pressable
                key={secenek}
                onPress={() => setKategori(secenek)}
                accessibilityRole="radio"
                accessibilityState={{ selected: secili }}
                style={[
                  styles.kategoriChip,
                  secili && styles.kategoriChipSecili
                ]}
              >
                <Text
                  style={[
                    styles.kategoriChipText,
                    secili && styles.kategoriChipTextSecili
                  ]}
                >
                  {secenek}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.seciliKategoriKutusu}>
          <Text style={styles.seciliKategoriEtiket}>
            SEÇİLEN KATEGORİ
          </Text>
          <Text style={styles.seciliKategoriDeger}>
            {kategori}
          </Text>
        </View>

        {/* FORM BUTONLARI */}
        <View style={styles.formButtons}>

          <Pressable
            onPress={talepKaydet}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.kaydetButon,
              pressed && styles.kaydetButonBasili
            ]}
          >
            <Text style={styles.kaydetText}>
              Talebi Kaydet
            </Text>
          </Pressable>

          <Pressable
            onPress={formuTemizle}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.temizleButon,
              pressed && styles.temizleButonBasili
            ]}
          >
            <Text style={styles.temizleText}>
              Temizle
            </Text>
          </Pressable>

        </View>

      </View>

      {/* TALEP LİSTESİ BAŞLIĞI */}
      <View style={styles.sectionHeader}>

        <Text style={styles.sectionTitle}>
          Destek Talepleri
        </Text>

        <Text style={styles.sectionCount}>
          {filtreliTalepler.length} kayıt
        </Text>

      </View>

      {/* FİLTRELER */}
      <View style={styles.filterContainer}>

        {FILTRELER.map((filtre) => (

          <Pressable
            key={filtre}
            onPress={() => setAktifFiltre(filtre)}
            style={[
              styles.filterButton,
              aktifFiltre === filtre &&
                styles.activeFilter
            ]}
          >
            <Text
              style={[
                styles.filterText,
                aktifFiltre === filtre &&
                  styles.activeFilterText
              ]}
            >
              {filtre}
            </Text>
          </Pressable>

        ))}

      </View>

      {/* KULLANIM İPUCU */}
      <View style={styles.ipucu}>
        <Text style={styles.ipucuIkon}>i</Text>
        <Text style={styles.ipucuText}>
          Detay için dokunun, silmek için uzun basın.
        </Text>
      </View>

    </View>
  );

  // EKRAN ÇIKTISI

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#0f1e33"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        <FlatList
          data={filtreliTalepler}

          keyExtractor={(item) => item.id}

          renderItem={({ item }) => (
            <TalepKarti
              talep={item}
              onAc={setSeciliId}
              onUzunBas={setSilinecekId}
            />
          )}

          ListHeaderComponent={listeBasligi}

          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Kayıt bulunamadı
              </Text>
              <Text style={styles.emptyText}>
                Bu filtreye uygun destek talebi yok.
                Yeni bir talep oluşturabilirsiniz.
              </Text>
            </View>
          }

          contentContainerStyle={styles.listContent}

          keyboardShouldPersistTaps="handled"

          showsVerticalScrollIndicator={false}
        />

      </KeyboardAvoidingView>

      {/* BİLDİRİM ÇUBUĞU — G8 */}
      {bildirim && (
        <View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[
            styles.toast,
            { backgroundColor: bildirimRengi(bildirim.tur) }
          ]}
        >
          <View style={styles.toastIkonKutusu}>
            <Text style={styles.toastIkon}>
              {bildirimIkonu(bildirim.tur)}
            </Text>
          </View>

          <Text style={styles.toastText}>
            {bildirim.mesaj}
          </Text>
        </View>
      )}

      {/* DETAY MODALI — G5, G7 */}
      <Modal
        visible={!!seciliTalep}
        transparent
        animationType="fade"
        onRequestClose={() => setSeciliId(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSeciliId(null)}
            accessibilityLabel="Detayı kapat"
          />

          {seciliTalep && (
            <View style={styles.modalKart}>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >

                {/* MODAL ÜST SATIR */}
                <View style={styles.modalUstSatir}>

                  <Text style={styles.modalId}>
                    {seciliTalep.id}
                  </Text>

                  <Pressable
                    onPress={() => setSeciliId(null)}
                    accessibilityRole="button"
                    accessibilityLabel="Kapat"
                    style={styles.modalKapat}
                  >
                    <Text style={styles.modalKapatText}>
                      ✕
                    </Text>
                  </Pressable>

                </View>

                <Text style={styles.modalBaslik}>
                  {seciliTalep.baslik}
                </Text>

                <View style={styles.modalDurumSatiri}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          durumRengi(seciliTalep.durum) + '18'
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: durumRengi(seciliTalep.durum) }
                      ]}
                    >
                      {seciliTalep.durum}
                    </Text>
                  </View>

                  <Text style={styles.modalTarih}>
                    Kayıt: {tarihYaz(seciliTalep.eklenmeTarihi)}
                  </Text>
                </View>

                <Text style={styles.detayEtiket}>
                  AÇIKLAMA
                </Text>

                <View style={styles.aciklamaKutusu}>
                  <Text style={styles.detayMetin}>
                    {seciliTalep.aciklama}
                  </Text>
                </View>

                <View style={styles.bilgiGrid}>

                  <View style={styles.bilgiKutu}>
                    <Text style={styles.bilgiEtiket}>
                      KATEGORİ
                    </Text>
                    <Text style={styles.bilgiDeger}>
                      {seciliTalep.kategori}
                    </Text>
                  </View>

                  <View style={styles.bilgiKutu}>
                    <Text style={styles.bilgiEtiket}>
                      ÖNCELİK
                    </Text>
                    <Text
                      style={[
                        styles.bilgiDeger,
                        { color: oncelikRengi(seciliTalep.oncelik) }
                      ]}
                    >
                      {seciliTalep.oncelik}
                    </Text>
                  </View>

                  {!!seciliTalep.birim && (
                    <View style={styles.bilgiKutu}>
                      <Text style={styles.bilgiEtiket}>
                        BİRİM
                      </Text>
                      <Text style={styles.bilgiDeger}>
                        {seciliTalep.birim}
                      </Text>
                    </View>
                  )}

                </View>

                <Text style={styles.detayEtiket}>
                  DURUMU GÜNCELLE
                </Text>

                <View style={styles.durumSecenekleri}>
                  {DURUMLAR.map((durum) => {
                    const secili = seciliTalep.durum === durum;
                    const renk = durumRengi(durum);

                    return (
                      <Pressable
                        key={durum}
                        onPress={() => durumDegistir(
                          seciliTalep.id,
                          durum
                        )}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: secili }}
                        style={[
                          styles.durumButon,
                          {
                            borderColor: renk,
                            backgroundColor: secili
                              ? renk
                              : renk + '0F'
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.durumButonText,
                            { color: secili ? '#ffffff' : renk }
                          ]}
                        >
                          {durum}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  onPress={() => setSeciliId(null)}
                  accessibilityRole="button"
                  style={styles.kapatButon}
                >
                  <Text style={styles.kapatButonText}>
                    Kapat
                  </Text>
                </Pressable>

                <Text style={styles.silmeIpucu}>
                  Bu talebi silmek için listede uzun basın.
                </Text>

              </ScrollView>

            </View>
          )}

        </View>
      </Modal>

      {/* SİLME ONAY MODALI — G6 */}
      <Modal
        visible={!!silinecekTalep}
        transparent
        animationType="fade"
        onRequestClose={silmeyiVazgec}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={silmeyiVazgec}
            accessibilityLabel="Silme onayını kapat"
          />

          {silinecekTalep && (
            <View style={styles.silmeKart}>

              <View style={styles.silmeIkon}>
                <Text style={styles.silmeIkonText}>
                  !
                </Text>
              </View>

              <Text style={styles.silmeBaslik}>
                Talebi silmek istiyor musunuz?
              </Text>

              <Text style={styles.silmeMetin}>
                <Text style={styles.silmeVurgu}>
                  {silinecekTalep.id}
                </Text>
                {' '}numaralı "{silinecekTalep.baslik}" talebi
                kalıcı olarak silinecek. Bu işlem geri alınamaz.
              </Text>

              <View style={styles.silmeButonlari}>

                <Pressable
                  onPress={silmeyiVazgec}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.vazgecButon,
                    pressed && styles.vazgecButonBasili
                  ]}
                >
                  <Text style={styles.vazgecText}>
                    Vazgeç
                  </Text>
                </Pressable>

                <Pressable
                  onPress={silmeyiOnayla}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.silButon,
                    pressed && styles.silButonBasili
                  ]}
                >
                  <Text style={styles.silText}>
                    Sil
                  </Text>
                </Pressable>

              </View>

            </View>
          )}

        </View>
      </Modal>

    </SafeAreaView>
  );
}

// UYGULAMA KÖKÜ

export default function App() {
  return (
    <SafeAreaProvider>
      <TeknikDestekPaneli />
    </SafeAreaProvider>
  );
}

// STİLLER

const styles = StyleSheet.create({

  flex: {
    flex: 1
  },

  container: {
    flex: 1,
    backgroundColor: '#e9edf3'
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 45,
    flexGrow: 1
  },

  // BAŞLIK — koyu lacivert kurumsal panel
  header: {
    backgroundColor: '#0f1e33',
    borderRadius: 18,
    padding: 22,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e3355',
    shadowColor: '#0f1e33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6
  },

  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7dd3fc',
    letterSpacing: 1.2
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 10,
    letterSpacing: 0.3
  },

  subtitle: {
    fontSize: 14,
    color: '#b6c2d6',
    marginTop: 8,
    lineHeight: 20
  },

  // ÖZET KARTLARI
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },

  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    minHeight: 112,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dde4ee',
    shadowColor: '#0f1e33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },

  summaryIndicator: {
    width: 32,
    height: 5,
    borderRadius: 3,
    marginBottom: 10
  },

  summaryNumber: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.3
  },

  summaryLabel: {
    color: '#5b6b82',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 5
  },

  // YENİ TALEP FORMU
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#dde4ee',
    shadowColor: '#0f1e33',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 9,
    elevation: 3
  },

  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10
  },

  formHeaderLeft: {
    flex: 1
  },

  formTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f1e33',
    letterSpacing: 0.2
  },

  formSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 5,
    lineHeight: 18
  },

  formBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },

  formBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1d4ed8',
    letterSpacing: 1
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 16,
    marginBottom: 6
  },

  requiredLabel: {
    color: '#dc2626'
  },

  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0f1e33',
    backgroundColor: '#f8fafc'
  },

  inputHatali: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2'
  },

  inputCokSatir: {
    minHeight: 96,
    paddingTop: 12,
    lineHeight: 21
  },

  inputMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6
  },

  hataText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
    lineHeight: 16
  },

  yardimText: {
    flex: 1,
    fontSize: 12,
    color: '#7c8aa0',
    lineHeight: 16
  },

  karakterSayaci: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8'
  },

  kategoriSatiri: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },

  kategoriChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc'
  },

  kategoriChipSecili: {
    backgroundColor: '#0f1e33',
    borderColor: '#0f1e33'
  },

  kategoriChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569'
  },

  kategoriChipTextSecili: {
    color: '#ffffff'
  },

  seciliKategoriKutusu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eef4ff',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#dbeafe'
  },

  seciliKategoriEtiket: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8
  },

  seciliKategoriDeger: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1d4ed8'
  },

  formButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20
  },

  kaydetButon: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3
  },

  kaydetButonBasili: {
    backgroundColor: '#1e40af'
  },

  kaydetText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3
  },

  temizleButon: {
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },

  temizleButonBasili: {
    backgroundColor: '#f1f5f9'
  },

  temizleText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700'
  },

  // LİSTE BAŞLIĞI
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f1e33',
    flexShrink: 1,
    letterSpacing: 0.2
  },

  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5b6b82',
    backgroundColor: '#dde4ee',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden'
  },

  // FİLTRELER
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    marginBottom: 14
  },

  filterButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#0f1e33',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1
  },

  activeFilter: {
    backgroundColor: '#0f1e33',
    borderColor: '#0f1e33',
    shadowOpacity: 0.2,
    elevation: 3
  },

  filterText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700'
  },

  activeFilterText: {
    color: '#ffffff'
  },

  ipucu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 2
  },

  ipucuIkon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#cbd5e1',
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 18,
    overflow: 'hidden'
  },

  ipucuText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b'
  },

  // TALEP KARTLARI — sol şerit durum rengi
  ticketCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dde4ee',
    borderLeftWidth: 5,
    shadowColor: '#0f1e33',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 9,
    elevation: 3,
    overflow: 'hidden'
  },

  ticketCardPressed: {
    backgroundColor: '#f8fafc',
    transform: [{ scale: 0.995 }]
  },

  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10
  },

  ticketId: {
    color: '#7c8aa0',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5
  },

  priorityBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },

  priorityText: {
    fontSize: 12,
    fontWeight: '800'
  },

  ticketTitle: {
    color: '#0f1e33',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
    lineHeight: 23
  },

  ticketDescription: {
    color: '#475569',
    fontSize: 13,
    marginTop: 7,
    lineHeight: 19
  },

  ticketDetail: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8
  },

  ticketBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eef2f7',
    gap: 10
  },

  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8
  },

  statusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3
  },

  ticketDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8'
  },

  // BOŞ LİSTE
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dde4ee',
    borderStyle: 'dashed'
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f1e33'
  },

  emptyText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 19
  },

  // BİLDİRİM ÇUBUĞU
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#0f1e33',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 9
  },

  toastIkonKutusu: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center'
  },

  toastIkon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900'
  },

  toastText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 19
  },

  // MODAL ORTAK
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 51, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18
  },

  modalKart: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '88%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#0f1e33',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12
  },

  modalScroll: {
    paddingBottom: 2
  },

  modalUstSatir: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  modalId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c8aa0',
    letterSpacing: 0.6
  },

  modalKapat: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center'
  },

  modalKapatText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569'
  },

  modalBaslik: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0f1e33',
    marginTop: 12,
    lineHeight: 28
  },

  modalDurumSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10
  },

  modalTarih: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94a3b8'
  },

  detayEtiket: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7c8aa0',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 7
  },

  aciklamaKutusu: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 13
  },

  detayMetin: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21
  },

  bilgiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },

  bilgiKutu: {
    flexGrow: 1,
    flexBasis: 130,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12
  },

  bilgiEtiket: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7c8aa0',
    letterSpacing: 0.8
  },

  bilgiDeger: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f1e33',
    marginTop: 4
  },

  durumSecenekleri: {
    flexDirection: 'row',
    gap: 8
  },

  durumButon: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center'
  },

  durumButonText: {
    fontSize: 12,
    fontWeight: '800'
  },

  kapatButon: {
    backgroundColor: '#0f1e33',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20
  },

  kapatButonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },

  silmeIpucu: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 11.5,
    color: '#94a3b8'
  },

  // SİLME ONAY MODALI
  silmeKart: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#0f1e33',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12
  },

  silmeIkon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center'
  },

  silmeIkonText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#dc2626'
  },

  silmeBaslik: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f1e33',
    textAlign: 'center',
    marginTop: 14
  },

  silmeMetin: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 9
  },

  silmeVurgu: {
    fontWeight: '800',
    color: '#0f1e33'
  },

  silmeButonlari: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    width: '100%'
  },

  vazgecButon: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center'
  },

  vazgecButonBasili: {
    backgroundColor: '#f1f5f9'
  },

  vazgecText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569'
  },

  silButon: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    alignItems: 'center'
  },

  silButonBasili: {
    backgroundColor: '#b91c1c'
  },

  silText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff'
  }

});
