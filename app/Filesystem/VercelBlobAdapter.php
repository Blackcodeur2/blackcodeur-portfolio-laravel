<?php

namespace App\Filesystem;

use League\Flysystem\Config;
use League\Flysystem\FileAttributes;
use League\Flysystem\FilesystemAdapter;
use League\Flysystem\UnableToCopyFile;
use League\Flysystem\UnableToDeleteFile;
use League\Flysystem\UnableToReadFile;
use League\Flysystem\UnableToRetrieveMetadata;
use League\Flysystem\UnableToWriteFile;
use VercelBlobPhp\Client;
use VercelBlobPhp\CommonCreateBlobOptions;
use VercelBlobPhp\ListCommandOptions;

class VercelBlobAdapter implements FilesystemAdapter
{
    protected Client $client;

    protected string $baseUrl;

    public function __construct(string $token, string $baseUrl)
    {
        $this->client = new Client($token);
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    protected function urlFor(string $path): string
    {
        return $this->baseUrl.'/'.ltrim($path, '/');
    }

    public function fileExists(string $path): bool
    {
        try {
            $this->client->head($this->urlFor($path));

            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }

    public function directoryExists(string $path): bool
    {
        return true; // Pas de vrais dossiers dans le stockage objet
    }

    public function write(string $path, string $contents, Config $config): void
    {
        try {
            $this->client->put(
                path: $path,
                content: $contents,
                options: new CommonCreateBlobOptions(
                    addRandomSuffix: false,
                    allowOverwrite: true,
                )
            );
        } catch (\Throwable $e) {
            throw UnableToWriteFile::atLocation($path, $e->getMessage(), $e);
        }
    }

    public function writeStream(string $path, $contents, Config $config): void
    {
        $this->write($path, stream_get_contents($contents), $config);
    }

    public function read(string $path): string
    {
        $content = @file_get_contents($this->urlFor($path));
        if ($content === false) {
            throw UnableToReadFile::fromLocation($path, 'HTTP fetch failed');
        }

        return $content;
    }

    public function readStream(string $path)
    {
        $stream = @fopen($this->urlFor($path), 'r');
        if ($stream === false) {
            throw UnableToReadFile::fromLocation($path, 'HTTP fetch failed');
        }

        return $stream;
    }

    public function delete(string $path): void
    {
        try {
            $this->client->del([$path]);
        } catch (\Throwable $e) {
            throw UnableToDeleteFile::atLocation($path, $e->getMessage(), $e);
        }
    }

    public function deleteDirectory(string $path): void
    {
        $prefix = rtrim($path, '/').'/';
        $list = $this->client->list(new ListCommandOptions(prefix: $prefix));
        $paths = array_map(fn ($blob) => $blob->pathname, $list->blobs ?? []);
        if (! empty($paths)) {
            $this->client->del($paths);
        }
    }

    public function createDirectory(string $path, Config $config): void
    {
        // No-op — pas de vrais dossiers dans le stockage objet
    }

    public function setVisibility(string $path, string $visibility): void
    {
        // No-op — la visibilité est fixée au niveau du store (public/private)
    }

    public function visibility(string $path): FileAttributes
    {
        return new FileAttributes($path, null, 'public');
    }

    public function mimeType(string $path): FileAttributes
    {
        try {
            $meta = $this->client->head($this->urlFor($path));

            return new FileAttributes($path, null, null, null, $meta->contentType ?? null);
        } catch (\Throwable $e) {
            throw UnableToRetrieveMetadata::mimeType($path, $e->getMessage());
        }
    }

    public function lastModified(string $path): FileAttributes
    {
        try {
            $meta = $this->client->head($this->urlFor($path));
            $timestamp = isset($meta->uploadedAt) ? strtotime($meta->uploadedAt) : null;

            return new FileAttributes($path, null, null, $timestamp);
        } catch (\Throwable $e) {
            throw UnableToRetrieveMetadata::lastModified($path, $e->getMessage());
        }
    }

    public function fileSize(string $path): FileAttributes
    {
        try {
            $meta = $this->client->head($this->urlFor($path));

            return new FileAttributes($path, $meta->size ?? null);
        } catch (\Throwable $e) {
            throw UnableToRetrieveMetadata::fileSize($path, $e->getMessage());
        }
    }

    public function listContents(string $path, bool $deep): iterable
    {
        $prefix = $path !== '' ? rtrim($path, '/').'/' : '';
        $result = $this->client->list(new ListCommandOptions(prefix: $prefix));

        foreach ($result->blobs ?? [] as $blob) {
            yield new FileAttributes($blob->pathname, $blob->size ?? null);
        }
    }

    public function move(string $source, string $destination, Config $config): void
    {
        $this->copy($source, $destination, $config);
        $this->delete($source);
    }

    public function copy(string $source, string $destination, Config $config): void
    {
        try {
            $this->client->copy(
                fromUrl: $this->urlFor($source),
                toPathname: $destination,
                options: new CommonCreateBlobOptions(addRandomSuffix: false, allowOverwrite: true)
            );
        } catch (\Throwable $e) {
            throw UnableToCopyFile::fromLocationTo($source, $destination, $e);
        }
    }
}
