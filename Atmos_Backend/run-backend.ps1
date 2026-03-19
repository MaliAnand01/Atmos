# Load .env file
if (Test-Path ".env") {
    Get-Content .env | Where-Object { $_ -notmatch "^#" -and $_ -match "=" } | ForEach-Object {
        $name, $value = $_ -split '=', 2
        [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), [System.EnvironmentVariableTarget]::Process)
    }
}

# Run the backend
.\mvnw.cmd spring-boot:run
