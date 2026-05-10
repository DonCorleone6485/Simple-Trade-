// 1. PHOTO_LIMIT sabitlerini güncelle (dosyanın üstünde):
const OWNER_EMAIL = 'asgharjafari2007@outlook.com';
const PHOTO_LIMIT_FREE = 1;
const PHOTO_LIMIT_PRO = 3;

// 2. TradeFormProps interface'ini güncelle:
interface TradeFormProps {
  onSave: (trade: Trade) => void;
  isPro?: boolean;
}

// 3. TradeForm fonksiyonunu güncelle:
export default function TradeForm({ onSave, isPro = false }: TradeFormProps) {
  const { t, language } = useLanguage();
  const { user } = useUser();

  const isOwner = user?.primaryEmailAddress?.emailAddress === OWNER_EMAIL;
  const photoLimit = isOwner ? Infinity : isPro ? PHOTO_LIMIT_PRO : PHOTO_LIMIT_FREE;

// 4. handlePhotoUpload fonksiyonunu güncelle:
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, kind: 'pre' | 'post') => {
    const files = Array.from(e.target.files || []) as File[];
    const current = kind === 'pre' ? prePhotos : postPhotos;

    if (!isOwner && current.length + files.length > photoLimit) {
      alert(`En fazla ${photoLimit} fotoğraf yükleyebilirsiniz.`);
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (kind === 'pre') setPrePhotos(p => [...p, reader.result as string]);
        else setPostPhotos(p => [...p, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

// 5. PhotoUploader'a isUnlimited yerine limit say geç:
// prePhotos için:
              <PhotoUploader
                photos={prePhotos}
                onUpload={e => handlePhotoUpload(e, 'pre')}
                onRemove={i => removePhoto(i, 'pre')}
                isUnlimited={isOwner}
                limit={photoLimit}
              />

// postPhotos için:
              <PhotoUploader
                photos={postPhotos}
                onUpload={e => handlePhotoUpload(e, 'post')}
                onRemove={i => removePhoto(i, 'post')}
                isUnlimited={isOwner}
                limit={photoLimit}
              />

// 6. PhotoUploader bileşenini güncelle:
function PhotoUploader({ photos, onUpload, onRemove, isUnlimited, limit = 1 }: {
  photos: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  isUnlimited?: boolean;
  limit?: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const canUploadMore = isUnlimited ? true : photos.length < limit;
