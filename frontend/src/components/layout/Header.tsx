'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

interface NavigationItem {
  name: string;
  href: string;
  dropdown?: { name: string; href: string }[];
  highlight?: boolean;
}

const kurumsalMenu = [
  { name: 'Vera Gayrimenkul', href: '/kurumsal/vera-gayrimenkul' },
  { name: 'Vera Grup', href: '/kurumsal/vera-grup' },
  { name: 'Hizmet Politikası', href: '/kurumsal/hizmet-politikasi' },
  { name: 'KVKK', href: '/kurumsal/kvkk' },
  
];

const hizmetlerMenu = [
  { name: 'Değerleme', href: '/hizmetler/degerleme' },
  { name: 'Danışmanlık', href: '/hizmetler/danismanlik' },
  { name: 'Analiz', href: '/hizmetler/analiz' },
];

const navigation: NavigationItem[] = [
  { name: 'Ana Sayfa', href: '/' },
  { name: 'İlanlar', href: '/ilanlar', highlight: true },
  { name: 'Hizmetler', href: '/hizmetler', dropdown: hizmetlerMenu },
  { name: 'Kurumsal', href: '/kurumsal', dropdown: kurumsalMenu },
  { name: 'Ekibimiz', href: '/ekibimiz' },
  { name: 'Referanslar', href: '/referanslar' },
  { name: 'Kariyer', href: '/kariyer' },
  { name: 'İletişim', href: '/iletisim' },
];



export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-vera-600/100 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:pl-16 lg:pr-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Vera Gayrimenkul</span>
            <img className="h-12 w-auto" src="/logo.png?v=2" alt="Vera Gayrimenkul" />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Ana menüyü aç</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            item.dropdown ? (
              <div 
                key={item.name}
                className="relative"
                onMouseEnter={() => setHoveredDropdown(item.name)}
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <button className="relative inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-white px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:text-gray-200 hover:bg-white/10 hover:shadow-md group">
                  {item.name}
                  <ChevronDownIcon 
                    className={`h-5 w-5 transition-all duration-300 ${
                      hoveredDropdown === item.name ? 'rotate-180' : 'rotate-0'
                    }`} 
                    aria-hidden="true" 
                  />
                  <span className="absolute bottom-0 left-1/2 h-0.5 bg-current transform -translate-x-1/2 transition-all duration-300 w-0 group-hover:w-1/2"></span>
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute left-1/2 z-50 mt-2 w-80 -translate-x-1/2 transform transition-all duration-300 ${
                  hoveredDropdown === item.name 
                    ? 'opacity-100 translate-y-0 visible' 
                    : 'opacity-0 -translate-y-2 invisible'
                }`}>
                  <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 bg-white/95 backdrop-blur-sm">
                    <div className="relative p-6">
                      {/* Decorative gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-vera-50/50 via-white to-vera-100/30"></div>
                      
                      <div className="relative space-y-3">
                        {item.dropdown.map((subItem, index) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="group flex items-center rounded-xl p-4 text-sm leading-6 hover:bg-vera-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md border border-transparent hover:border-vera-200"
                          >
                            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-vera-100 to-vera-200 group-hover:from-vera-200 group-hover:to-vera-300 transition-all duration-300">
                              <div className="h-6 w-6 text-vera-600 font-bold flex items-center justify-center">
                                {index + 1}
                              </div>
                            </div>
                            <div className="ml-4 flex-auto">
                              <p className="text-base font-semibold text-gray-900 group-hover:text-vera-600 transition-colors duration-300">
                                {subItem.name}
                              </p>
                            </div>
                            <div className="ml-2 h-5 w-5 text-vera-400 group-hover:text-vera-600 transition-colors duration-300">
                              →
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`relative text-sm font-semibold leading-6 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  item.highlight 
                    ? 'text-vera-yellow-400 hover:text-vera-yellow-300 hover:bg-vera-yellow-400/10 hover:shadow-lg font-bold' 
                    : 'text-white hover:text-gray-200 hover:bg-white/10 hover:shadow-md'
                } group`}
              >
                {item.name}
                <span className={`absolute bottom-0 left-1/2 h-0.5 bg-current transform -translate-x-1/2 transition-all duration-300 ${
                  item.highlight ? 'w-0 group-hover:w-3/4' : 'w-0 group-hover:w-1/2'
                }`}></span>
              </Link>
            )
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Vera Gayrimenkul</span>
              <img className="h-10 w-auto" src="/logo.png?v=2" alt="Vera Gayrimenkul" />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Menüyü kapat</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <div className="space-y-2">
                        <div className="font-semibold text-gray-900 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-vera-50 hover:text-vera-600 cursor-pointer border-l-4 border-transparent hover:border-vera-600">{item.name}</div>
                        <div className="pl-4 space-y-2">
                          {item.dropdown.map((subItem) => (
                                                          <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 transition-all duration-300 transform hover:translate-x-1 hover:bg-gray-50 hover:text-vera-600 hover:shadow-sm border-l-2 border-transparent hover:border-vera-300"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {subItem.name}
                              </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 transition-all duration-300 transform hover:translate-x-2 hover:shadow-md ${
                          item.highlight 
                            ? 'text-vera-600 bg-vera-50 hover:bg-vera-100 hover:shadow-vera-200/50 font-bold border-l-4 border-vera-600' 
                            : 'text-gray-900 hover:bg-gray-50 border-l-4 border-transparent hover:border-vera-600'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
} 