'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, Clock } from 'lucide-react';
import { AdImage } from '@/components/AdImage';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  images?: string[];
  location: string;
  createdAt: string;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
  };
  condition?: string;
}

interface AdCardProps {
  ad: Ad;
}

export function AdCard({ ad }: AdCardProps) {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: ad.currency || 'XOF',
  }).format(ad.price);

  const createdDate = new Date(ad.createdAt);
  const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Link href={`/anuncios/${ad.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-200 aspect-square">
          {(ad.image || ad.images?.[0]) ? (
            <AdImage
              src={ad.image || ad.images?.[0]}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-gray-500">Sem imagem</span>
            </div>
          )}
          {ad.condition && (
            <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              {ad.condition === 'new' ? 'Novo' : ad.condition === 'like_new' ? 'Como novo' : 'Usado'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{ad.title}</h3>

          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{ad.description}</p>

          {/* Price */}
          <p className="text-2xl font-bold text-blue-600 mb-3">{formattedPrice}</p>

          {/* Location & Date */}
          <div className="flex items-center gap-4 text-gray-500 text-sm mb-3 border-t pt-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {ad.location}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {daysAgo === 0 ? 'Hoje' : daysAgo === 1 ? 'Ontem' : `${daysAgo}d atrás`}
            </div>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-2 border-t pt-3">
            {ad.seller.avatar && (
              <AdImage
                src={ad.seller.avatar}
                alt={ad.seller.firstName}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {ad.seller.firstName} {ad.seller.lastName}
              </p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">{(ad.seller.rating ?? 0).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
