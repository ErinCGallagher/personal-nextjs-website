import Image from "next/image";
import Link from "next/link";

const apps = [
  {
    name: "Pagebound",
    icon: "/icons/pagebound.png",
    url: "https://pagebound.co",
    description:
      "My go-to app for discovering books and inspiring me to read. I love participating in the reddit style community book threads and read alongs.",
  },
  {
    name: "TravelSpend",
    icon: "/icons/travelspend.png",
    url: "https://travel-spend.com/",
    description:
      "After a year of travel, I can confirm it's the best expense app. The graphs, filtering, multi-currency and expense splitting features are incredible.",
  },
  {
    name: "Babbel",
    icon: "/icons/babbel2.png",
    url: "https://www.babbel.com",
    description:
      "Babbel makes learning languages feel natural and practical. With a focus on grammar and real-life conversations, it has helped me become fluent in French.",
  },
  {
    name: "HouseSigma",
    icon: "/icons/housesigma.png",
    url: "https://housesigma.com",
    description:
      "Real estate market data in Canada should be free and accessible to all! Housesigma allows everyone to make informed decisions.",
  },
  {
    name: "Wanderlog",
    icon: "/icons/wanderlog.png",
    url: "https://wanderlog.com",
    description:
      "Easiest way to create detailed travel itineraries. The gmail integration allows me organize all the bookings and confirmations in one place",
  },
  {
    name: "AllTrails",
    icon: "/icons/alltrails.png",
    url: "https://www.alltrails.com/",
    description:
      "After over one hundred hikes, AllTrails is my go-to. Offline maps, trail reviews, and photos ensure I'm prepared for every adventure, even without cell service.",
  },
];

export function Favourites() {
  return (
    <section className="w-full py-12">
      <h2 className="text-2xl font-semibold text-foreground text-center md:text-left dark:text-white mb-8">
        My Favourite Apps
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {apps.map((app) => (
          <Link
            key={app.name}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="relative w-20 h-20 mb-4">
              <Image
                src={app.icon}
                alt={`${app.name} icon`}
                fill
                className="object-contain rounded-2xl"
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">
              {app.name}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center leading-relaxed">
              {app.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
