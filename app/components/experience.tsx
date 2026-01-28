export function Experience() {
  const experiences = [
    {
      company: "Uber",
      title: "Staff Software Engineer",
      dates: "Aug 2024 - Present",
    },
    {
      company: "Uber",
      title: "Senior Software Engineer",
      dates: "Oct 2019 - Aug 2024",
    },
    {
      company: "Connected",
      title: "Software Engineer, Team Lead",
      dates: "Aug 2018 - Oct 2019",
    },
    {
      company: "TD Bank",
      title: "IT Solutions Developer, Android & iOS",
      dates: "July 2016 - Aug 2018",
    },
  ];

  return (
    <section className="w-full pt-6">
      <h2 className="text-2xl font-semibold text-foreground text-center md:text-left dark:text-white mb-8">
        Experience
      </h2>
      {/* <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 transition-colors hover:border-blue-500 dark:hover:border-blue-400"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-foreground dark:text-white">
                  {exp.company}
                </h3>
                <p className="text-base text-gray-700 dark:text-gray-300 mt-1">
                  {exp.title}
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {exp.dates}
              </p>
            </div>
          </div>
        ))}
      </div> */}
      <div className="mt-6 text-center md:text-left">
        <a
          href="/resume.pdf"
          download="Erin_Gallagher_Resume.pdf"
          className="inline-block px-6 py-3 bg-grey-blue hover:bg-grey-blue/80 text-white font-semibold rounded-lg transition-colors"
        >
          Download Resume →
        </a>
      </div>
    </section>
  );
}
