export function Experience() {
  const experiences = [
    {
      company: "Company Name",
      title: "Job Title",
      dates: "Month Year - Month Year",
    },
    {
      company: "Company Name",
      title: "Job Title",
      dates: "Month Year - Month Year",
    },
    {
      company: "Company Name",
      title: "Job Title",
      dates: "Month Year - Month Year",
    },
  ];

  return (
    <section className="w-full py-12">
      <h2 className="text-2xl font-semibold text-black dark:text-white mb-8">
        Experience
      </h2>
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-black dark:text-white">
              {exp.company}
            </h3>
            <p className="text-base text-gray-700 dark:text-gray-300 mt-1">
              {exp.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {exp.dates}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <a
          href="/resume.pdf"
          download="Erin_Gallagher_Resume.pdf"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Download Resume →
        </a>
      </div>
    </section>
  );
}
