namespace Infrastructure.Photos
{
    public class CloudinarySettings
    {
        public string CloudName { get; set; }
        public string ApiKey { get; set; }
        public string ApiSecret { get; set; }

    }
}

//dotnet user-secrets set "Cloudinary:CloudName" "rukfash"
//dotnet user-secrets set "Cloudinary:ApiKey" "187771562966287"
//dotnet user-secrets set "Cloudinary:ApiSecret" "CCfpcez1AZutIsaUP3l_NB8SI4o"
//dotnet user-secrets-list