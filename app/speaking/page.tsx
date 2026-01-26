import Image from "next/image";

export default function Speaking() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-black dark:text-white mb-4">
            Speaking
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            I enjoy sharing my knowledge and experiences with the tech community.
            Here are some of my recent speaking engagements.
          </p>
        </header>

        {/* Photos Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-6">
            Speaking Moments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Portrait photo - full height on left */}
            <div className="relative aspect-[3/4] md:row-span-2 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src="/images/speaking/girls-ghc.jpg"
                alt="Speaking at Grace Hopper Celebration"
                fill
                className="object-cover"
              />
            </div>

            {/* Two landscape photos stacked on right */}
            <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src="/images/speaking/ghc-speaking.jpg"
                alt="Speaking at Grace Hopper Celebration"
                fill
                className="object-cover"
              />
            </div>

            <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
              <Image
                src="/images/speaking/sophie-erin.jpg"
                alt="Speaking at Grace Hopper Celebration"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Talks Section */}
        <section className="space-y-12">
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-6">
            Recent Talks
          </h2>

          {/* Talk 1 */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              From Rollout to Resilience: A Case Study in Monitoring and Alerting Grocery Ads at Uber
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Grace Hopper Celebration • October 2024
            </p>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <iframe
                src="https://docs.google.com/presentation/d/1an3lLsx4B__E9njnLOVlrBJ1IXz89Yj1qMLzKC-yXTs/embed"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title="From Rollout to Resilience: A Case Study in Monitoring and Alerting Grocery Ads at Uber"
              />
            </div>
          </div>

          {/* Talk 2 */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              Building Scalable Cross Platform Mobile Apps with Uber's RIBs Architecture
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Grace Hopper Celebration • October 2024
            </p>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <iframe
                src="https://docs.google.com/presentation/d/1H1gILiNqb3Lq_wIa99h0a6cbS2p12vrzqfYsogidtTk/embed"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title="Building Scalable Cross Platform Mobile Apps with Uber's RIBs Architecture"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
