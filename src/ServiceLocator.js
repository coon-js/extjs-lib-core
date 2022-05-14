/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Service provider for ServiceLocator-pattern.
 * Provides a central registry for concrete service classes that can be
 * queried using their abstract representant.
 *
 * @example
 *
 *   const gravatar = Ext.create("coon.core.service.GravatarService");
 *
 *   // if any module requires the UserImageService, return the GravatarService-concrete.
 *   coon.core.ServiceLocator.register("coon.core.service.UserImageService", gravatar);
 *
 *   coon.core.ServiceLocator.resolve("coon.core.service.UserImageService");
 *
 */
Ext.define("coon.core.ServiceLocator", {

    singleton: true,

    requires: [
        "coon.core.service.Service"
    ],


    /**
     * Register a service.
     *
     * @param {String} className the fqn of the class that provides the abstract for the service
     * @param {coon.core.service.Service} service The concrete service that will be used
     *
     * @throws {Error}  if a service for className was already registered, if the service is not an
     * instance of {coon.core.service.Service} or not a specific of the specified className,
     * or if the class specified with className was not found
     */
    register (className, service) {
        const me = this;
        
        if (!me.services) {
            me.services = {};
        }

        if (me.services[className]) {
            throw new Error(`A service for "${className}" was already registered.`);
        }

        const extClass = Ext.ClassManager.get(className);
        if (!extClass) {
            throw new Error(`Could not find the service "${className}". ` +
                "Make sure it is loaded with it's owning package.");
        }

        if (!(service instanceof coon.core.service.Service)) {
            throw new Error("the submitted service must be an instance of coon.core.service.Service");
        }

        if (!(service instanceof extClass)) {
            throw new Error(`"${service.$className}" must be an instance of ${className}`);
        }

        me.services[className] = service;

        return service;
    },


    /**
     * Returns the service that was registered for the className.
     *
     * @param {String} className
     *
     * @returns {coon.core.service.Service} The concrete service instance, or undefined
     * if none was found.
     */
    resolve (className) {
        return this.services ? this.services[className] : undefined;
    }
    
    
});