const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <section className="page-header-margin">
          <h1 className="text-2xl text-center sm:text-left sm:text-4xl md:text-5xl font-bold text-primary mb-3 sm:mb-4 leading-tight">
            About Us
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to Srinivasa Jewellers. We offer a wide variety of high-quality gold and silver jewelry.
            Our shop has been serving the community for over 30 years.
          </p>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Visit our shop at:</p>
            <p className="text-gray-600">
              Bajana Mandhir Road<br />
              Opposite Government Hospital<br />
              Bagepalli
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Find Our Location</h2>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d968.7287125381109!2d77.79338142196417!3d13.784006417789168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb18f00240650bd%3A0x62848c289690f845!2sSRINIVASA%20JEWELLERY!5e0!3m2!1sen!2sin!4v1734758949830!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;