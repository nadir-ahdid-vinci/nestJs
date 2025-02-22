const Services = () => {
  const services = [
    {
      title: "Service 1",
      description: "Description détaillée du service 1",
      icon: "🚀",
    },
    {
      title: "Service 2",
      description: "Description détaillée du service 2",
      icon: "💡",
    },
    {
      title: "Service 3",
      description: "Description détaillée du service 3",
      icon: "⚡",
    },
  ]

  return (
    <div className="container mx-auto px-4">
      <div className="py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Nos Services</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h2>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Services

