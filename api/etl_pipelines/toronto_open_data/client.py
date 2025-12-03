import aiohttp

class CityOfTorontoClient:
    BASE_URL = "https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action"

    def __init__(self):
        pass

    async def get(self, session: aiohttp.ClientSession, endpoint: str, params: dict = {}):
        """
        Fetches data from a given endpoint using aiohttp.ClientSession.get.

        Args:
            session (aiohttp.ClientSession): The client session to use for the request.
            endpoint (str): The URL endpoint to send the GET request to.
            params (dict): A dictionary of query parameters to include in the request.
        """
        url = self.BASE_URL + endpoint
        try:
            async with session.get(url, params=params) as response:
                response.raise_for_status()
                return await response.json()
        except aiohttp.ClientError as e:
            print(f"Error during request: {e}")
            return None
        
    async def get_package_metadata(self, package_id: str):
        """
        Fetches metadata for a specific package by its ID.

        Args:
            package_id (str): The unique identifier of the package.
        """
        endpoint = "/package_show"
        params = {"id": package_id}
        
        async with aiohttp.ClientSession() as session:
            return await self.get(session, endpoint, params)
        
    async def get_resource_metadata(self, package_id: str, resource_name: str):
        """
        Fetches metadata for a specific resource within a package.

        Args:
            package_id (str): The unique identifier of the package.
            resource_name (str): The name of the resource.
        """
        package_data = await self.get_package_metadata(package_id)
        if package_data and package_data.get("success"):
            resources = package_data["result"].get("resources", [])
            for resource in resources:
                if resource["name"] == resource_name:
                    return resource
        return None
    
    async def get_resource_url(self, package_id: str, resource_name: str):
        """
        Fetches the URL for a specific resource within a package.

        Args:
            package_id (str): The unique identifier of the package.
            resource_name (str): The name of the resource.
        """
        resource_metadata = await self.get_resource_metadata(package_id, resource_name)
        if resource_metadata:
            return resource_metadata.get("url")
        return None
    
    async def get_resource_data(self, package_id: str, resource_name: str, json_content_type: str = None):
        """
        Fetches the actual data from a specific resource within a package.

        Args:
            package_id (str): The unique identifier of the package.
            resource_name (str): The name of the resource.
        """
        resource_url = await self.get_resource_url(package_id, resource_name)
        if resource_url:
            async with aiohttp.ClientSession() as session:
                try:
                    async with session.get(resource_url) as response:
                        response.raise_for_status()
                        return await response.json(content_type=json_content_type)
                except aiohttp.ClientError as e:
                    print(f"Error fetching resource data: {e}")
                    return None
        return None

