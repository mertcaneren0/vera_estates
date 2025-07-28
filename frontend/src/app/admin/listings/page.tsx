"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  HomeIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  BuildingOffice2Icon,
  MapIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

// Tip tanımlamaları
type PropertyType = "Satılık Daire" | "Kiralık Daire" | "Satılık Arsa" | "Tarla" | "Satılık İş Yeri" | "Kiralık İş Yeri";
type PropertyStatus = "Aktif" | "Pasif";
type CreditEligibility = "Evet" | "Hayır" | "Bilinmiyor";
type DeedType = "Müstakil" | "Hisseli" | "Tahsis" | "Diğer";
type ListingSource = "Sahibinden" | "Emlak Ofisinden";
type SwapOption = "Evet" | "Hayır";
type RoomType = "1+0" | "1+1" | "2+1" | "3+1" | "4+1" | "5+ ve üzeri";
type BuildingAge = "0" | "1-5" | "5-10" | "10-15" | "15-20" | "20+";
type HeatingType = "Merkezi" | "Kombi" | "Klima" | "Doğalgaz" | "Soba" | "Yok";
type KitchenType = "Açık" | "Kapalı";
type ParkingType = "Açık" | "Kapalı" | "Yok";
type UsageStatus = "Boş" | "Kiracılı" | "Mal Sahibi";
type ZoningType = "Konut" | "Ticari" | "Tarla" | "Arsa" | "Diğer";
type BusinessType = "Ofis" | "Dükkan" | "İmalathane" | "Depo" | "Diğer";
type PropertyCondition = "İlk Sahip" | "İkinci El";

// Admin Notları için tip tanımlamaları
type NoteType = "GENERAL" | "VIEWING" | "NEGOTIATION" | "DOCUMENT" | "REMINDER" | "IMPORTANT";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface AdminNote {
  id: string;
  listingId: string;
  title: string;
  content: string;
  noteType: NoteType;
  priority: Priority;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface BaseProperty {
  // Genel Ortak Alanlar
  id: string;
  title: string;
  description: string;
  price: string;
  city: string;
  district: string;
  neighborhood: string;
  grossArea: string;
  netArea: string;
  creditEligible: CreditEligibility;
  deedType: DeedType;
  listingSource: ListingSource;
  swapOption: SwapOption;
  listingDate: string;
  status: PropertyStatus;
  type: PropertyType;
  images: string[] | File[]; // İmajlar şimdi ya string array ya da File array olabilir
  order?: number; // Sıralama için yeni alan
}

interface Apartment extends BaseProperty {
  roomType: RoomType;
  buildingAge: BuildingAge;
  floor: string;
  totalFloors: string;
  heatingType: HeatingType;
  bathroomCount: string;
  kitchenType: KitchenType;
  hasBalcony: boolean;
  hasElevator: boolean;
  parkingType: ParkingType;
  isFurnished: boolean;
  usageStatus: UsageStatus;
  isInComplex: boolean;
  complexName?: string;
  dues?: string;
  deposit?: string; // Sadece kiralık için
}

interface Land extends BaseProperty {
  zoningType: ZoningType;
  blockNumber: string;
  parcelNumber: string;
  mapNumber: string;
  floorAreaRatio: string;
  heightLimit: string;
}

interface Field extends BaseProperty {
  zoningType: ZoningType;
  blockNumber: string;
  parcelNumber: string;
  topography?: string;
  irrigation?: string;
  roadStatus?: string;
}

interface Business extends BaseProperty {
  roomCount: string;
  floorCount: string;
  buildingAge: BuildingAge;
  heatingType: HeatingType;
  elevatorCount: string;
  hasTenant: boolean;
  condition: PropertyCondition;
  deposit?: string; // Sadece kiralık için
  businessType: BusinessType;
}

type Property = Apartment | Land | Field | Business;

// Form için başlangıç değerleri
const initialFormData: Partial<Property> = {
  title: "",
  description: "",
  price: "",
  city: "",
  district: "",
  neighborhood: "",
  grossArea: "",
  netArea: "",
  creditEligible: "Bilinmiyor",
  deedType: "Müstakil",
  listingSource: "Sahibinden",
  swapOption: "Hayır",
  listingDate: new Date().toISOString().split('T')[0],
  status: "Aktif",
  type: "Satılık Daire",
  images: [],
};

export default function ListingsPage() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Partial<Property>>(initialFormData);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Admin Notları için state'ler
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedListingForNotes, setSelectedListingForNotes] = useState<Property | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteFormData, setNoteFormData] = useState({
    title: '',
    content: '',
    noteType: 'GENERAL' as NoteType,
    priority: 'MEDIUM' as Priority,
    isPrivate: false
  });
  const [editingNote, setEditingNote] = useState<AdminNote | null>(null);

  // Form input ve select stilleri için ortak sınıflar
  const inputBaseClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";
  const placeholderClasses = "placeholder:text-navy-600 placeholder:opacity-70";
  const selectedTextClasses = "text-gray-900";
  
  // Modal helper functions
  const openEditModal = (listing: Property) => {
    console.log('🎯 Opening EDIT modal for:', listing.title);
    console.log('📋 Original listing data:', {
      id: listing.id,
      title: listing.title,
      type: listing.type,
      price: listing.price,
      status: listing.status,
      city: listing.city,
      district: listing.district,
      images: listing.images?.length || 0
    });
    
    // Önce modal'ı temizle
    setIsAddModalOpen(false);
    setSelectedListing(null);
    setFormData(initialFormData);
    
    // Kısa bir delay ile yeniden aç (state cleanup için)
    setTimeout(() => {
      setSelectedListing(listing);
      console.log('✅ selectedListing set');
      
      // Mevcut resimleri existingImages'a kaydet
      if (listing.images && Array.isArray(listing.images)) {
        // Sadece string tipindeki resimleri existingImages'a ekle
        const stringImages = listing.images.filter(img => typeof img === 'string') as string[];
        setExistingImages(stringImages);
        console.log('📸 Existing images set:', stringImages.length);
      } else {
        setExistingImages([]);
        console.log('📸 No existing images');
      }
      
      // Yeni resimler için state'i sıfırla
      setNewImages([]);
      console.log('🖼️ New images cleared');
      
      // Doğrudan form data'yı set et
      const formattedData = {
        ...listing,
        images: [], // Form için boş olarak ayarla
        listingDate: listing.listingDate ? new Date(listing.listingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
      console.log('📝 Formatted data to set:', {
        title: formattedData.title,
        type: formattedData.type,
        price: formattedData.price,
        status: formattedData.status,
        listingDate: formattedData.listingDate
      });
      
      setFormData(formattedData);
      console.log('✅ formData set - checking with timeout');
      
      // Modal'ı aç
      setIsAddModalOpen(true);
      console.log('✅ Modal opened - formData should now contain:', formattedData.title);
      
      // Form data'nın gerçekten setlendiğini kontrol et
      setTimeout(() => {
        console.log('🔍 Verification - FormData after 100ms:', {
          title: formattedData.title,
          type: formattedData.type,
          price: formattedData.price
        });
      }, 100);
    }, 50);
  };

  const openNewModal = () => {
    console.log('🆕 Opening NEW modal');
    setSelectedListing(null);
    setFormData(initialFormData);
    setExistingImages([]);
    setNewImages([]);
    setIsAddModalOpen(true);
    console.log('✅ New modal opened successfully');
  };

  // FormData değişikliklerini izle (debug için)
  useEffect(() => {
    console.log('📊 FormData CHANGED:', {
      title: formData.title || 'EMPTY',
      type: formData.type || 'EMPTY',
      price: formData.price || 'EMPTY',
      status: formData.status || 'EMPTY',
      city: formData.city || 'EMPTY',
      isModalOpen: isAddModalOpen,
      isSelectedListing: !!selectedListing,
      selectedListingId: selectedListing?.id || 'NONE'
    });
  }, [formData, isAddModalOpen, selectedListing]);



  // İlanları yükle
  useEffect(() => {
    fetchListings();
  }, []);

  // Property type değiştiğinde form alanlarını sıfırla (SADECE YENİ İLAN MODUNDA)
  useEffect(() => {
    // Sadece yeni ilan ekleme modunda (selectedListing null ise) ve modal açıksa reset yap
    if (isAddModalOpen && !selectedListing && formData.type) {
      console.log('🔄 Resetting form for new listing due to type change');
      setFormData(prev => ({
        ...initialFormData,
        type: prev.type,
      }));
    }
  }, [formData.type, isAddModalOpen, selectedListing]);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings');
      const result = await response.json();
      if (result.success) {
        setListings(result.data);
      }
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Admin Notları için fonksiyonlar
  const fetchNotes = async (listingId: string) => {
    setNotesLoading(true);
    try {
      const response = await fetch(`/api/admin-notes?listingId=${listingId}`);
      const result = await response.json();
      if (result.success) {
        setNotes(result.data);
      }
    } catch (error) {
      console.error('Notlar yüklenirken hata:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  const openNotesModal = async (listing: Property) => {
    setSelectedListingForNotes(listing);
    setIsNotesModalOpen(true);
    // Geçici olarak devre dışı - Admin notes API'si Prisma kullanıyor
    // await fetchNotes(listing.id);
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!noteFormData.title || !noteFormData.content || !selectedListingForNotes) {
      alert('Lütfen başlık ve içerik alanlarını doldurun');
      return;
    }

    try {
      const url = editingNote ? '/api/admin-notes' : '/api/admin-notes';
      const method = editingNote ? 'PUT' : 'POST';
      
      const body = editingNote 
        ? { ...noteFormData, id: editingNote.id }
        : { ...noteFormData, listingId: String(selectedListingForNotes.id) };

      console.log('Sending note request:', { url, method, body });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);
      
      if (result.success) {
        alert(editingNote ? 'Not başarıyla güncellendi!' : 'Not başarıyla eklendi!');
        setIsAddNoteModalOpen(false);
        setEditingNote(null);
        setNoteFormData({
          title: '',
          content: '',
          noteType: 'GENERAL',
          priority: 'MEDIUM',
          isPrivate: false
        });
        
        // Notları yeniden yükle
        if (selectedListingForNotes) {
          await fetchNotes(selectedListingForNotes.id);
        }
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (error) {
      console.error('Not kaydetme hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      alert(`Not kaydedilirken bir hata oluştu: ${errorMessage}`);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin-notes?id=${noteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Not başarıyla silindi!');
        if (selectedListingForNotes) {
          await fetchNotes(selectedListingForNotes.id);
        }
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (error) {
      console.error('Not silme hatası:', error);
      alert('Not silinirken bir hata oluştu');
    }
  };

  const editNote = (note: AdminNote) => {
    setEditingNote(note);
    setNoteFormData({
      title: note.title,
      content: note.content,
      noteType: note.noteType,
      priority: note.priority,
      isPrivate: note.isPrivate
    });
    setIsAddNoteModalOpen(true);
  };



  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    console.log('🖊️ Input change detected:', { name, value, type, isEditMode: !!selectedListing });
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      };
      console.log('📝 New form data after change:', newData);
      return newData;
    });
  };

  // handleFileChange fonksiyonunu güncelleyelim
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      // Yeni resimler için ayrı bir state kullan
      setNewImages(prev => [...prev, ...fileArray]);
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setSelectedListing(null);
    setExistingImages([]);
    setNewImages([]);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.title || !formData.type || !formData.price) {
      alert('Lütfen zorunlu alanları doldurun: İlan Başlığı, İlan Türü, Fiyat');
      return;
    }
    
    try {
      console.log('Form data being submitted:', formData);
      
      // FormData oluştur
      const submitFormData = new FormData();
      
      // Tüm form verilerini FormData'ya ekle
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            submitFormData.append(key, value.toString());
          } else {
            submitFormData.append(key, value.toString());
          }
        }
      });
      
      // Yeni yüklenen dosyaları ekle
      if (newImages.length > 0) {
        newImages.forEach((file) => {
          submitFormData.append('images', file);
        });
      }

      // Mevcut listing ID'sini ekle
      if (selectedListing?.id) {
        submitFormData.append('id', String(selectedListing.id));
      }

      // Mevcut resimleri JSON formatında ekle
      if (existingImages && existingImages.length > 0) {
        submitFormData.append('imageURLs', JSON.stringify(existingImages));
      }
      
      console.log('FormData contents:');
      for (let [key, value] of submitFormData.entries()) {
        console.log(key, value);
      }
      
      // API'ye gönder
      const response = await fetch('/api/listings', {
        method: 'POST',
        body: submitFormData,
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API response:', result);
      
      if (result.success) {
        alert(selectedListing ? 'İlan başarıyla güncellendi!' : 'İlan başarıyla eklendi!');
        setIsAddModalOpen(false);
        setSelectedListing(null);
        setExistingImages([]);
        setNewImages([]);
        setFormData(initialFormData);
        // Listeyi güncelle
        fetchListings();
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (error) {
      console.error('Form gönderim hatası:', error);
      alert('İlan eklenirken bir hata oluştu: ' + (error as Error).message);
    }
  };

  // Property type'a göre form alanlarını render et
  const renderPropertySpecificFields = () => {
    const type = formData.type;

    if (type?.includes("Daire")) {
      return (
        <>
                          <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="roomType" className="block text-sm font-medium text-gray-700">
                    Oda Sayısı
                  </label>
                  <select
                    name="roomType"
                    id="roomType"
                    value={(formData as Apartment).roomType || "1+1"}
                    onChange={handleInputChange}
                    className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                  >
                    <option value="1+0">1+0</option>
                    <option value="1+1">1+1</option>
                    <option value="2+1">2+1</option>
                    <option value="3+1">3+1</option>
                    <option value="4+1">4+1</option>
                    <option value="5+ ve üzeri">5+ ve üzeri</option>
                  </select>
                </div>

                          <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="buildingAge" className="block text-sm font-medium text-gray-700">
                    Bina Yaşı
                  </label>
                  <select
                    name="buildingAge"
                    id="buildingAge"
                    value={(formData as Apartment).buildingAge || "1-5"}
                    onChange={handleInputChange}
                    className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                  >
                    <option value="0">0</option>
                    <option value="1-5">1-5</option>
                    <option value="5-10">5-10</option>
                    <option value="10-15">10-15</option>
                    <option value="15-20">15-20</option>
                    <option value="20+">20+</option>
                  </select>
                </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
              Bulunduğu Kat
            </label>
            <input
              type="text"
              name="floor"
              id="floor"
              value={(formData as Apartment).floor || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="totalFloors" className="block text-sm font-medium text-gray-700">
              Kat Sayısı
            </label>
            <input
              type="text"
              name="totalFloors"
              id="totalFloors"
              value={(formData as Apartment).totalFloors || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            />
          </div>

                          <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="heatingType" className="block text-sm font-medium text-gray-700">
                    Isıtma Tipi
                  </label>
                  <select
                    name="heatingType"
                    id="heatingType"
                    value={(formData as Apartment).heatingType || "Kombi"}
                    onChange={handleInputChange}
                    className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                  >
                    <option value="Merkezi">Merkezi</option>
                    <option value="Kombi">Kombi</option>
                    <option value="Klima">Klima</option>
                    <option value="Doğalgaz">Doğalgaz</option>
                    <option value="Soba">Soba</option>
                    <option value="Yok">Yok</option>
                  </select>
                </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="bathroomCount" className="block text-sm font-medium text-gray-700">
              Banyo Sayısı
            </label>
            <input
              type="text"
              name="bathroomCount"
              id="bathroomCount"
              value={(formData as Apartment).bathroomCount || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            />
          </div>

                          <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="kitchenType" className="block text-sm font-medium text-gray-700">
                    Mutfak Tipi
                  </label>
                  <select
                    name="kitchenType"
                    id="kitchenType"
                    value={(formData as Apartment).kitchenType || "Kapalı"}
                    onChange={handleInputChange}
                    className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                  >
                    <option value="Açık">Açık</option>
                    <option value="Kapalı">Kapalı</option>
                  </select>
                </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Özellikler
            </label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasBalcony"
                  id="hasBalcony"
                  checked={(formData as Apartment).hasBalcony || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="hasBalcony" className="ml-2 block text-sm text-gray-700">
                  Balkon
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasElevator"
                  id="hasElevator"
                  checked={(formData as Apartment).hasElevator || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="hasElevator" className="ml-2 block text-sm text-gray-700">
                  Asansör
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFurnished"
                  id="isFurnished"
                  checked={(formData as Apartment).isFurnished || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isFurnished" className="ml-2 block text-sm text-gray-700">
                  Eşyalı
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isInComplex"
                  id="isInComplex"
                  checked={(formData as Apartment).isInComplex || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isInComplex" className="ml-2 block text-sm text-gray-700">
                  Site İçerisinde
                </label>
              </div>
            </div>
          </div>

          {(formData as Apartment).isInComplex && (
            <>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="complexName" className="block text-sm font-medium text-gray-700">
                  Site Adı
                </label>
                <input
                  type="text"
                  name="complexName"
                  id="complexName"
                  value={(formData as Apartment).complexName || ""}
                  onChange={handleInputChange}
                  className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="dues" className="block text-sm font-medium text-gray-700">
                  Aidat
                </label>
                <input
                  type="text"
                  name="dues"
                  id="dues"
                  value={(formData as Apartment).dues || ""}
                  onChange={handleInputChange}
                  className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                />
              </div>
            </>
          )}

          {type === "Kiralık Daire" && (
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">
                Depozito (TL)
              </label>
              <input
                type="text"
                name="deposit"
                id="deposit"
                value={(formData as Apartment).deposit || ""}
                onChange={handleInputChange}
                className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
              />
            </div>
          )}
        </>
      );
    }

    if (type === "Satılık Arsa" || type === "Tarla") {
      return (
        <>
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="zoningType" className="block text-sm font-medium text-gray-700">
              İmar Durumu
            </label>
            <select
              name="zoningType"
              id="zoningType"
              value={(formData as Land).zoningType || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            >
              <option value="Konut">Konut</option>
              <option value="Ticari">Ticari</option>
              <option value="Tarla">Tarla</option>
              <option value="Arsa">Arsa</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="blockNumber" className="block text-sm font-medium text-gray-700">
              Ada No
            </label>
            <input
              type="text"
              name="blockNumber"
              id="blockNumber"
              value={(formData as Land).blockNumber || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="parcelNumber" className="block text-sm font-medium text-gray-700">
              Parsel No
            </label>
            <input
              type="text"
              name="parcelNumber"
              id="parcelNumber"
              value={(formData as Land).parcelNumber || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="mapNumber" className="block text-sm font-medium text-gray-700">
              Pafta No
            </label>
            <input
              type="text"
              name="mapNumber"
              id="mapNumber"
              value={(formData as Land).mapNumber || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="floorAreaRatio" className="block text-sm font-medium text-gray-700">
              Kaks (Emsal)
            </label>
            <input
              type="text"
              name="floorAreaRatio"
              id="floorAreaRatio"
              value={(formData as Land).floorAreaRatio || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="heightLimit" className="block text-sm font-medium text-gray-700">
              Gabari
            </label>
            <input
              type="text"
              name="heightLimit"
              id="heightLimit"
              value={(formData as Land).heightLimit || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            />
          </div>

          {type === "Tarla" && (
            <>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="topography" className="block text-sm font-medium text-gray-700">
                  Topografya
                </label>
                <input
                  type="text"
                  name="topography"
                  id="topography"
                  value={(formData as Field).topography || ""}
                  onChange={handleInputChange}
                  className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="irrigation" className="block text-sm font-medium text-gray-700">
                  Sulama
                </label>
                <input
                  type="text"
                  name="irrigation"
                  id="irrigation"
                  value={(formData as Field).irrigation || ""}
                  onChange={handleInputChange}
                  className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="roadStatus" className="block text-sm font-medium text-gray-700">
                  Yol Durumu
                </label>
                <input
                  type="text"
                  name="roadStatus"
                  id="roadStatus"
                  value={(formData as Field).roadStatus || ""}
                  onChange={handleInputChange}
                  className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                />
              </div>
            </>
          )}
        </>
      );
    }

    if (type?.includes("İş Yeri")) {
      return (
        <>
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
              İş Yeri Tipi
            </label>
            <select
              name="businessType"
              id="businessType"
              value={(formData as Business).businessType || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            >
              <option value="Ofis">Ofis</option>
              <option value="Dükkan">Dükkan</option>
              <option value="İmalathane">İmalathane</option>
              <option value="Depo">Depo</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="roomCount" className="block text-sm font-medium text-gray-700">
              Oda/Bölüm Sayısı
            </label>
            <input
              type="text"
              name="roomCount"
              id="roomCount"
              value={(formData as Business).roomCount || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="floorCount" className="block text-sm font-medium text-gray-700">
              Kat Sayısı
            </label>
            <input
              type="text"
              name="floorCount"
              id="floorCount"
              value={(formData as Business).floorCount || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="buildingAge" className="block text-sm font-medium text-gray-700">
              Bina Yaşı
            </label>
            <select
              name="buildingAge"
              id="buildingAge"
              value={(formData as Business).buildingAge || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            >
              <option value="0">0</option>
              <option value="1-5">1-5</option>
              <option value="5-10">5-10</option>
              <option value="10-15">10-15</option>
              <option value="15-20">15-20</option>
              <option value="20+">20+</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="heatingType" className="block text-sm font-medium text-gray-700">
              Isıtma Tipi
            </label>
            <select
              name="heatingType"
              id="heatingType"
              value={(formData as Business).heatingType || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            >
              <option value="Merkezi">Merkezi</option>
              <option value="Kombi">Kombi</option>
              <option value="Klima">Klima</option>
              <option value="Doğalgaz">Doğalgaz</option>
              <option value="Soba">Soba</option>
              <option value="Yok">Yok</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="elevatorCount" className="block text-sm font-medium text-gray-700">
              Asansör Sayısı
            </label>
            <input
              type="text"
              name="elevatorCount"
              id="elevatorCount"
              value={(formData as Business).elevatorCount || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Özellikler
            </label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasTenant"
                  id="hasTenant"
                  checked={(formData as Business).hasTenant || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="hasTenant" className="ml-2 block text-sm text-gray-700">
                  Kiracılı
                </label>
              </div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
              Durumu
            </label>
            <select
              name="condition"
              id="condition"
              value={(formData as Business).condition || ""}
              onChange={handleInputChange}
              className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
            >
              <option value="İlk Sahip">İlk Sahip</option>
              <option value="İkinci El">İkinci El</option>
            </select>
          </div>

          {type === "Kiralık İş Yeri" && (
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">
                Depozito (TL)
              </label>
              <input
                type="text"
                name="deposit"
                id="deposit"
                value={(formData as Business).deposit || ""}
                onChange={handleInputChange}
                className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
              />
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">İlan Yönetimi</h1>
            <p className="mt-1 text-sm text-gray-600">
              Tüm gayrimenkul ilanlarını buradan yönetebilirsiniz
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-vera-600 hover:bg-vera-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vera-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Yeni İlan Ekle
          </button>
        </div>

        {/* İlanlar Tablosu */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İlan Başlığı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tür
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Konum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Henüz ilan bulunmuyor. İlk ilanınızı ekleyin.
                    </td>
                  </tr>
                ) : (
                  listings.map((listing: Property) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {listing.images && listing.images.length > 0 && (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {listing.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {listing.description?.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {listing.type?.includes('Daire') && <HomeIcon className="h-5 w-5 text-gray-400 mr-2" />}
                          {listing.type?.includes('Arsa') && <MapIcon className="h-5 w-5 text-gray-400 mr-2" />}
                          {listing.type?.includes('İş Yeri') && <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />}
                          {listing.type === 'Tarla' && <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-2" />}
                          <span className="text-sm text-gray-900">{listing.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          listing.type?.includes('Satılık') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {listing.type?.includes('Satılık') ? 'Satılık' : 'Kiralık'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {listing.price ? `₺${Number(listing.price).toLocaleString('tr-TR')}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {listing.city}, {listing.district}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          listing.status === 'Aktif' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {listing.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(listing.listingDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openNotesModal(listing)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Notlar"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(listing)}
                          className="text-vera-600 hover:text-vera-900 mr-3"
                          title="Düzenle"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
                              try {
                                const response = await fetch(`/api/listings?id=${listing.id}`, {
                                  method: 'DELETE',
                                });
                                const result = await response.json();
                                if (result.success) {
                                  alert('İlan başarıyla silindi!');
                                  fetchListings();
                                } else {
                                  alert('Hata: ' + result.error);
                                }
                              } catch (error) {
                                alert('İlan silinirken hata oluştu.');
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Sil"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* İlan Ekleme/Düzenleme Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {selectedListing ? "İlanı Düzenle" : "Yeni İlan Ekle"}
              </h2>
              
              {/* DEBUG INFO - Geliştirme amaçlı */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">🐛 Debug Info:</h4>
                  <div className="text-xs text-yellow-700 space-y-1">
                    <div>Modal Mode: {selectedListing ? 'EDIT' : 'NEW'}</div>
                    <div>Selected Listing ID: {selectedListing?.id || 'None'}</div>
                    <div>Form Title: "{formData.title || 'Empty'}"</div>
                    <div>Form Type: "{formData.type || 'Empty'}"</div>
                    <div>Form Price: "{formData.price || 'Empty'}"</div>
                    <div>Existing Images: {existingImages.length}</div>
                    <div>New Images: {newImages.length}</div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* İlan Türü */}
                  <div className="col-span-2">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      İlan Türü
                    </label>
                    <select
                      name="type"
                      id="type"
                      value={formData.type ?? ""}
                      onChange={handleInputChange}
                      className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                      onFocus={(e) => console.log('🏷️ Type select focused, current value:', e.target.value)}
                    >
                      <option value="" disabled className={placeholderClasses}>İlan türü seçiniz</option>
                      <option value="Satılık Daire" className={selectedTextClasses}>Satılık Daire</option>
                      <option value="Kiralık Daire" className={selectedTextClasses}>Kiralık Daire</option>
                      <option value="Satılık Arsa" className={selectedTextClasses}>Satılık Arsa</option>
                      <option value="Tarla" className={selectedTextClasses}>Tarla</option>
                      <option value="Satılık İş Yeri" className={selectedTextClasses}>Satılık İş Yeri</option>
                      <option value="Kiralık İş Yeri" className={selectedTextClasses}>Kiralık İş Yeri</option>
                    </select>
                  </div>

                  {/* İlan Durumu */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      İlan Durumu
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vera-500 focus:ring-vera-500 sm:text-sm"
                    >
                      <option value="">Seçiniz</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Pasif">Pasif</option>
                    </select>
                  </div>

                  {/* Sıralama */}
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                      Sıralama (Küçük sayı = Üstte görünür)
                    </label>
                    <input
                      type="number"
                      name="order"
                      id="order"
                      value={formData.order || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vera-500 focus:ring-vera-500 sm:text-sm"
                      placeholder="Örn: 1, 2, 3..."
                    />
                  </div>

                  {/* Genel Ortak Alanlar */}
                  <div className="col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      İlan Başlığı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title ?? ""}
                      onChange={handleInputChange}
                      placeholder="İlan başlığını giriniz"
                      className={`${inputBaseClasses} ${formData.title ? selectedTextClasses : placeholderClasses}`}
                      onFocus={(e) => console.log('📍 Title input focused, current value:', e.target.value)}
                      onBlur={(e) => console.log('👋 Title input blurred, final value:', e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Açıklama
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      placeholder="İlan açıklamasını giriniz"
                      className={`${inputBaseClasses} ${formData.description ? selectedTextClasses : placeholderClasses}`}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Fiyat
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="price"
                        id="price"
                        value={formData.price ?? ""}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className={`${inputBaseClasses} pr-12 ${formData.price ? selectedTextClasses : placeholderClasses}`}
                        onFocus={(e) => console.log('💰 Price input focused, current value:', e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">TL</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      İl
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city || ""}
                      onChange={handleInputChange}
                      placeholder="İl seçiniz"
                      className={`${inputBaseClasses} ${formData.city ? selectedTextClasses : placeholderClasses}`}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                      İlçe
                    </label>
                    <input
                      type="text"
                      name="district"
                      id="district"
                      value={formData.district || ""}
                      onChange={handleInputChange}
                      placeholder="İlçe seçiniz"
                      className={`${inputBaseClasses} ${formData.district ? selectedTextClasses : placeholderClasses}`}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">
                      Mahalle
                    </label>
                    <input
                      type="text"
                      name="neighborhood"
                      id="neighborhood"
                      value={formData.neighborhood || ""}
                      onChange={handleInputChange}
                      placeholder="Mahalle seçiniz"
                      className={`${inputBaseClasses} ${formData.neighborhood ? selectedTextClasses : placeholderClasses}`}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="grossArea" className="block text-sm font-medium text-gray-700">
                      Brüt Alan (m²)
                    </label>
                    <input
                      type="text"
                      name="grossArea"
                      id="grossArea"
                      value={formData.grossArea || ""}
                      onChange={handleInputChange}
                      className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="netArea" className="block text-sm font-medium text-gray-700">
                      Net Alan (m²)
                    </label>
                    <input
                      type="text"
                      name="netArea"
                      id="netArea"
                      value={formData.netArea || ""}
                      onChange={handleInputChange}
                      className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="creditEligible" className="block text-sm font-medium text-gray-700">
                      Krediye Uygunluk
                    </label>
                    <select
                      name="creditEligible"
                      id="creditEligible"
                      value={formData.creditEligible || ""}
                      onChange={handleInputChange}
                      className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                    >
                      <option value="" disabled className={placeholderClasses}>Krediye uygunluk seçiniz</option>
                      <option value="Evet" className={selectedTextClasses}>Evet</option>
                      <option value="Hayır" className={selectedTextClasses}>Hayır</option>
                      <option value="Bilinmiyor" className={selectedTextClasses}>Bilinmiyor</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="deedType" className="block text-sm font-medium text-gray-700">
                      Tapu Durumu
                    </label>
                    <select
                      name="deedType"
                      id="deedType"
                      value={formData.deedType || ""}
                      onChange={handleInputChange}
                      className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                    >
                      <option value="Müstakil">Müstakil</option>
                      <option value="Hisseli">Hisseli</option>
                      <option value="Tahsis">Tahsis</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="listingSource" className="block text-sm font-medium text-gray-700">
                      Kimden
                    </label>
                    <select
                      name="listingSource"
                      id="listingSource"
                      value={formData.listingSource || ""}
                      onChange={handleInputChange}
                      className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                    >
                      <option value="Sahibinden">Sahibinden</option>
                      <option value="Emlak Ofisinden">Emlak Ofisinden</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="swapOption" className="block text-sm font-medium text-gray-700">
                      Takas
                    </label>
                    <select
                      name="swapOption"
                      id="swapOption"
                      value={formData.swapOption || ""}
                      onChange={handleInputChange}
                      className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                    >
                      <option value="Evet">Evet</option>
                      <option value="Hayır">Hayır</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="listingDate" className="block text-sm font-medium text-gray-700">
                      İlan Tarihi
                    </label>
                    <input
                      type="date"
                      name="listingDate"
                      id="listingDate"
                      value={formData.listingDate || ""}
                      onChange={handleInputChange}
                      className={`${inputBaseClasses} ${formData.type ? selectedTextClasses : placeholderClasses}`}
                    />
                  </div>

                  {/* Property Type'a göre özel alanlar */}
                  {renderPropertySpecificFields()}

                  {/* Fotoğraflar */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Fotoğraflar
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-vera-600 hover:text-vera-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-vera-500"
                          >
                            <span>Fotoğraf Yükle</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              accept="image/*,.heic,.heif"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">veya sürükleyip bırakın</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          JPG, PNG, WEBP, HEIC, GIF, BMP, TIFF - Max 20MB
                        </p>
                      </div>
                    </div>
                    
                    {/* Yeni yüklenen dosyaları göster */}
                    {newImages && newImages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Yeni Seçilen Dosyalar ({newImages.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {newImages.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <span className="text-sm text-gray-600 truncate">
                                {file.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewImages(prev => prev.filter((_, i) => i !== index));
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mevcut resimleri göster */}
                    {existingImages && existingImages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Mevcut Resimler ({existingImages.length})
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          {existingImages.map((imgUrl, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={imgUrl} 
                                alt={`Mevcut resim ${index + 1}`}
                                className="h-24 w-24 object-cover rounded-md" 
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-property.jpg';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setExistingImages(prev => prev.filter((_, i) => i !== index));
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Resmi kaldır"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-vera-600 hover:bg-vera-700"
                  >
                    {selectedListing ? "Güncelle" : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Notları Modal */}
        {isNotesModalOpen && selectedListingForNotes && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    İlan Notları
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedListingForNotes.title}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setEditingNote(null);
                      setNoteFormData({
                        title: '',
                        content: '',
                        noteType: 'GENERAL',
                        priority: 'MEDIUM',
                        isPrivate: false
                      });
                      setIsAddNoteModalOpen(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-vera-600 hover:bg-vera-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Yeni Not
                  </button>
                  <button
                    onClick={() => {
                      setIsNotesModalOpen(false);
                      setSelectedListingForNotes(null);
                      setNotes([]);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Kapat
                  </button>
                </div>
              </div>

              {/* Notlar Listesi */}
              <div className="space-y-4">
                {notesLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Notlar yükleniyor...</div>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz not yok</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Bu ilan için henüz not eklenmemiş.
                    </p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-vera-500">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-sm font-medium text-gray-900">{note.title}</h4>
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              note.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                              note.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                              note.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {note.priority === 'URGENT' ? 'Acil' :
                               note.priority === 'HIGH' ? 'Yüksek' :
                               note.priority === 'MEDIUM' ? 'Orta' : 'Düşük'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              note.noteType === 'IMPORTANT' ? 'bg-purple-100 text-purple-800' :
                              note.noteType === 'VIEWING' ? 'bg-blue-100 text-blue-800' :
                              note.noteType === 'NEGOTIATION' ? 'bg-green-100 text-green-800' :
                              note.noteType === 'DOCUMENT' ? 'bg-gray-100 text-gray-800' :
                              note.noteType === 'REMINDER' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {note.noteType === 'IMPORTANT' ? 'Önemli' :
                               note.noteType === 'VIEWING' ? 'Görüntüleme' :
                               note.noteType === 'NEGOTIATION' ? 'Pazarlık' :
                               note.noteType === 'DOCUMENT' ? 'Belge' :
                               note.noteType === 'REMINDER' ? 'Hatırlatma' : 'Genel'}
                            </span>
                            {note.isPrivate && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                <EyeIcon className="h-3 w-3 mr-1" />
                                Özel
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{note.content}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{new Date(note.createdAt).toLocaleDateString('tr-TR')}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(note.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => editNote(note)}
                            className="text-vera-600 hover:text-vera-900"
                            title="Düzenle"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Not Ekleme/Düzenleme Modal */}
        {isAddNoteModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingNote ? "Notu Düzenle" : "Yeni Not Ekle"}
              </h3>
              
              <form onSubmit={handleNoteSubmit} className="space-y-4">
                <div>
                  <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700">
                    Başlık <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="noteTitle"
                    value={noteFormData.title}
                    onChange={(e) => setNoteFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vera-500 focus:ring-vera-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700">
                    İçerik <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="noteContent"
                    rows={4}
                    value={noteFormData.content}
                    onChange={(e) => setNoteFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vera-500 focus:ring-vera-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="noteType" className="block text-sm font-medium text-gray-700">
                      Not Türü
                    </label>
                    <select
                      id="noteType"
                      value={noteFormData.noteType}
                      onChange={(e) => setNoteFormData(prev => ({ ...prev, noteType: e.target.value as NoteType }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vera-500 focus:ring-vera-500 sm:text-sm"
                    >
                      <option value="GENERAL">Genel</option>
                      <option value="VIEWING">Görüntüleme</option>
                      <option value="NEGOTIATION">Pazarlık</option>
                      <option value="DOCUMENT">Belge</option>
                      <option value="REMINDER">Hatırlatma</option>
                      <option value="IMPORTANT">Önemli</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Öncelik
                    </label>
                    <select
                      id="priority"
                      value={noteFormData.priority}
                      onChange={(e) => setNoteFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-vera-500 focus:ring-vera-500 sm:text-sm"
                    >
                      <option value="LOW">Düşük</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HIGH">Yüksek</option>
                      <option value="URGENT">Acil</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={noteFormData.isPrivate}
                      onChange={(e) => setNoteFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-vera-600 focus:ring-vera-500"
                    />
                    <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                      Özel Not
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddNoteModalOpen(false);
                      setEditingNote(null);
                      setNoteFormData({
                        title: '',
                        content: '',
                        noteType: 'GENERAL',
                        priority: 'MEDIUM',
                        isPrivate: false
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-vera-600 hover:bg-vera-700"
                  >
                    {editingNote ? "Güncelle" : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 