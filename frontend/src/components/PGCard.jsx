import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Heart, IndianRupee, Users, ShieldCheck, Wifi } from 'lucide-react';

const PGCard = ({ pg, index = 0 }) => {
  // Use a predictable but engaging unsplash placeholder if no image exists
  const defaultImage = [
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1628592102751-ba83b0314276?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ][index % 4];

  return (
    <Link to={`/pg/${pg.pgId || pg.id}`} className="group block h-full">
      <div className="bg-white rounded-3xl h-full flex flex-col premium-shadow border border-slate-100 premium-card-hover overflow-hidden relative">
        
        {/* Heart Favorite Button */}
        <div className="absolute top-4 right-4 z-10 text-white hover:text-red-500 transition-colors cursor-pointer drop-shadow-md">
          <Heart className="w-6 h-6 fill-current opacity-70 hover:opacity-100" />
        </div>

        {/* Image Section */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
          <img 
            src={pg.image || defaultImage} 
            alt={pg.pgName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
          {pg.rating >= 4.5 && (
            <div className="absolute top-4 left-4 glass-panel px-3 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center shadow-sm">
              <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />
              Guest Favorite
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-1">
             <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
               {pg.pgName}
             </h3>
             <div className="flex items-center text-sm font-semibold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-lg">
                <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                {pg.rating ? pg.rating.toFixed(1) : "4.5"}
             </div>
          </div>
          
          <div className="flex items-center text-slate-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span className="truncate">{pg.area}, {pg.city}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 font-medium flex-wrap">
             <div className="flex items-center bg-slate-50 px-2 py-1 rounded-md">
               <Users className="w-3.5 h-3.5 mr-1" />
               1-3 Sharing
             </div>
             <div className="flex items-center bg-slate-50 px-2 py-1 rounded-md">
               <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-500" />
               Verified
             </div>
             {(pg.type || 'Both') === 'Boys' && (
               <div className="flex items-center bg-sky-50 px-2 py-1 rounded-md text-sky-600 font-bold ml-auto border border-sky-100">
                 📞 9573768293
               </div>
             )}
             {(pg.type || 'Both') === 'Both' && (
               <div className="flex items-center bg-purple-50 px-2 py-1 rounded-md text-purple-600 font-bold ml-auto border border-purple-100">
                 📞 8712305169
               </div>
             )}
             {(pg.type || 'Both') === 'Girls' && (
               <div className="flex items-center bg-pink-50 px-2 py-1 rounded-md text-pink-600 font-bold ml-auto border border-pink-100">
                 📞 6302781284
               </div>
             )}
          </div>

          {/* Bottom Price Row */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">Starting from</p>
              <div className="flex items-center text-slate-900">
                <IndianRupee className="w-4 h-4 text-slate-900" />
                <span className="font-extrabold text-xl">{pg.price ? pg.price.toLocaleString() : "5,000"}</span>
                <span className="text-sm font-normal text-slate-500 ml-1">/ mo</span>
              </div>
            </div>
            
            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md">
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PGCard;
