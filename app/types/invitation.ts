export type RootAccessMode =
  | 'redirect-random'
  | 'render-random'
  | 'blocked';

export type InvitationStatus = 'draft' | 'published' | 'archived';

export type TemplateDefinition = {
  id: number;
  name: string;
  description: string;
  previewImage: string;
  published: boolean;
  sortOrder: number;
};

export type InvitationAccount = {
  id: string;
  role: string;
  holder: string;
  bank: string;
  accountNumber: string;
};

export type InvitationMapLink = {
  id: string;
  name: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export type InvitationGalleryImage = {
  src: string;
  alt: string;
};

export type InvitationData = {
  slug: string;
  ownerEmail: string;
  status: InvitationStatus;
  couple: {
    groom: {
      name: string;
      fullName: string;
      fatherName: string;
      motherName: string;
      relationLabel: string;
    };
    bride: {
      name: string;
      fullName: string;
      fatherName: string;
      motherName: string;
      relationLabel: string;
    };
  };
  event: {
    dateTime: string;
    dateLabel: string;
    month: number;
    day: number;
    dayOfWeek: string;
    timeLabel: string;
    venueName: string;
    hallName: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  metadata: {
    title: string;
    description: string;
    siteName: string;
    ogImage: string;
  };
  settings: {
    allowedTemplateIds: number[];
    rootAccessMode: RootAccessMode;
  };
  content: {
    intro: {
      variant: 'curtain';
      duration: number;
      delay: number;
      autoOpen: boolean;
      lockScroll: boolean;
      eyebrow: string;
      title: string;
      openLabel: string;
      preOpenOffset: number;
      openingVideoSrc: string;
    };
    backgroundMusic: {
      variant: 'none' | 'wedding';
      src: string;
      autoPlay: boolean;
      loop: boolean;
      volume: number;
      showControl: boolean;
    };
    cover: {
      photoSrc: string;
      statement: string;
      date: string;
      groomLabel: string;
      brideLabel: string;
    };
    greeting: {
      quote: string;
      quoteSource: string;
      messages: string[];
      family: {
        groomParentsLabel: string;
        brideParentsLabel: string;
      };
    };
    calendar: {
      enabled: boolean;
    };
    gallery: {
      title: string;
      images: InvitationGalleryImage[];
    };
    location: {
      title: string;
      mapLinks: InvitationMapLink[];
    };
    accounts: {
      enabled: boolean;
      title: string;
      groomSectionTitle: string;
      brideSectionTitle: string;
      groom: InvitationAccount[];
      bride: InvitationAccount[];
    };
    rsvp: {
      enabled: boolean;
      title: string;
      descriptionLines: string[];
      submitLabel: string;
    };
    guestbook: {
      enabled: boolean;
      title: string;
      description: string;
      submitLabel: string;
    };
    signoff: {
      imageSrc: string;
      imageAlt: string;
      kakaoTitle: string;
      kakaoDescription: string;
      kakaoImage: string;
      kakaoButtonLabel: string;
      shareButtonLabel: string;
      copyButtonLabel: string;
    };
  };
};

export type InvitationStats = {
  todayVisitors: number;
  totalVisitors: number;
};

export type RsvpEntry = {
  id: string;
  name: string;
  side: 'groom' | 'bride';
  attendance: 'attending' | 'not-attending' | 'undecided';
  guestCount: number;
  meal: 'yes' | 'no' | 'undecided';
  phone: string;
  message: string;
  createdAt: string;
};

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  passwordHint: string;
  isHidden: boolean;
  createdAt: string;
};

export type DashboardData = {
  invitation: InvitationData;
  templates: TemplateDefinition[];
  stats: InvitationStats;
  rsvps: RsvpEntry[];
  guestbook: GuestbookEntry[];
};
